<?php
/**
 * @file classes/Geo/SchemaOrgGeo.inc.php
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @class SchemaOrgGeo
 *
 * @brief Convert stored GeoJSON / admin-unit bbox data into the schema.org
 *        shape vocabulary: GeoCoordinates for points, GeoShape line/polygon
 *        for line and polygon features, GeoShape box for admin-unit bboxes.
 *        Follows ESIPFed science-on-schema.org conventions.
 *
 *        schema.org GeoShape uses lat-lon (Y X) order — opposite of GeoJSON's
 *        lon-lat (X Y). All coordinates are swapped on emit.
 */

namespace geoMetadata\classes\Geo;

class SchemaOrgGeo
{
    /**
     * Source-tag value attached to article-extent geometries via
     * schema.org additionalProperty.
     */
    public const SOURCE_ARTICLE_EXTENT  = 'articleSpatialExtent';
    public const SOURCE_ADMIN_UNIT_BBOX = 'administrativeUnitBoundingBox';

    /**
     * Build the schema.org geometries for the article's stored GeoJSON.
     *
     * Returns either a single shape (one geometry) or a numerically indexed
     * array of shapes. Each emitted shape carries an additionalProperty
     * tagging its origin as the article-author-provided spatial extent.
     * Returns null when there are no features.
     *
     * @param string|null $geoJson Stored GeoJSON FeatureCollection string, or null.
     * @return array|null
     */
    public static function buildArticleGeometries(?string $geoJson): ?array
    {
        if (!$geoJson) return null;

        $decoded = json_decode($geoJson);
        $features = $decoded->features ?? [];

        $shapes = [];
        foreach ($features as $feature) {
            $geometry = $feature->geometry ?? null;
            if (!$geometry) continue;
            foreach (self::geometryToShapes($geometry) as $shape) {
                $shapes[] = self::tagShape($shape, self::SOURCE_ARTICLE_EXTENT);
            }
        }

        if (empty($shapes)) return null;
        return count($shapes) === 1 ? $shapes[0] : $shapes;
    }

    /**
     * Build a GeoShape{box} for an admin-unit bbox object.
     *
     * Antimeridian-crossing bboxes are emitted as east<west, matching the
     * plugin's DC.box / ISO 19139 emissions.
     *
     * @return array|null
     */
    public static function buildAdminUnitBoxShape($bbox): ?array
    {
        if (!isset($bbox->north, $bbox->south, $bbox->east, $bbox->west)) return null;
        return [
            '@type' => 'GeoShape',
            'box'   => $bbox->south . ' ' . $bbox->west . ' ' . $bbox->north . ' ' . $bbox->east,
        ];
    }

    /**
     * Convert a GeoJSON geometry object into one or more schema.org shapes
     * (without source tags — callers wrap with tagShape() as needed).
     *
     * @return array[] List of associative-array shapes.
     */
    private static function geometryToShapes(object $geometry): array
    {
        $type = $geometry->type ?? null;
        $coords = $geometry->coordinates ?? null;
        if (!$type || $coords === null) return [];

        switch ($type) {
            case 'Point':
                return [self::pointToCoords($coords)];

            case 'MultiPoint':
                return array_map([self::class, 'pointToCoords'], $coords);

            case 'LineString':
                return [self::lineStringToShape($coords)];

            case 'MultiLineString':
                return array_map([self::class, 'lineStringToShape'], $coords);

            case 'Polygon':
                return [self::polygonRingsToShape($coords)];

            case 'MultiPolygon':
                return array_map([self::class, 'polygonRingsToShape'], $coords);

            default:
                return [];
        }
    }

    /**
     * GeoJSON Point [lon, lat] -> schema.org GeoCoordinates.
     */
    private static function pointToCoords(array $position): array
    {
        return [
            '@type'     => 'GeoCoordinates',
            'latitude'  => 0 + $position[1],
            'longitude' => 0 + $position[0],
        ];
    }

    /**
     * GeoJSON LineString [[lon, lat], …] -> GeoShape with line "lat lon lat lon …".
     */
    private static function lineStringToShape(array $positions): array
    {
        return [
            '@type' => 'GeoShape',
            'line'  => self::positionsToLatLonString($positions),
        ];
    }

    /**
     * GeoJSON Polygon (rings) -> GeoShape with polygon "lat lon … lat lon" of outer ring.
     * Inner rings (holes) are dropped — schema.org GeoShape has no native hole model.
     */
    private static function polygonRingsToShape(array $rings): array
    {
        return [
            '@type'   => 'GeoShape',
            'polygon' => self::positionsToLatLonString($rings[0]),
        ];
    }

    /**
     * Attach a `geometrySource` PropertyValue to a shape so consumers can
     * tell article-extent geometries apart from admin-unit bbox shapes
     * without inspecting their parent Place.
     */
    public static function tagShape(array $shape, string $sourceValue): array
    {
        $shape['additionalProperty'] = [
            '@type'      => 'PropertyValue',
            'propertyID' => 'geometrySource',
            'value'      => $sourceValue,
        ];
        return $shape;
    }

    private static function positionsToLatLonString(array $positions): string
    {
        $parts = [];
        foreach ($positions as $p) {
            $parts[] = $p[1] . ' ' . $p[0];
        }
        return implode(' ', $parts);
    }
}
