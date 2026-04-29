<?php
/**
 * @file classes/Geo/Centroid.inc.php
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @class Centroid
 *
 * @brief Compute a bbox-centre point for a GeoJSON FeatureCollection,
 *        using brick/geo against the OJS DB when available, falling back
 *        to a pure-PHP bbox walk. Both paths return the envelope centre
 *        of the combined geometry.
 */

namespace geoMetadata\classes\Geo;

class Centroid
{
    /**
     * Compute the centroid of the combined geometry of a stored GeoJSON string.
     *
     * @param string $geoJson Stringified GeoJSON (typically a FeatureCollection).
     * @param \PDO|null $pdo  Optional PDO handle used by brick/geo's PdoEngine.
     *                        Pass null to always use the pure-PHP fallback.
     * @return array{0: float, 1: float}|null [lat, lon] or null if no coords found.
     */
    public static function fromGeoJson(string $geoJson, ?\PDO $pdo = null): ?array
    {
        $decoded = json_decode($geoJson);
        if ($decoded === null) {
            return null;
        }
        $bbox = self::bboxFromGeoJson($decoded);
        if ($bbox === null) {
            return null;
        }

        // PDOEngine::envelope() is Cartesian (MySQL ST_Envelope); it returns a
        // world-spanning box for antimeridian-crossing geometries. Fall straight
        // through to the pure-PHP midpoint in that case.
        $crossing = $bbox->east < $bbox->west;

        if ($pdo !== null && !$crossing) {
            try {
                $reader    = new \Brick\Geo\IO\GeoJSONReader();
                $parsed    = $reader->read($geoJson);
                $geometry  = self::extractGeometry($parsed);
                if ($geometry !== null) {
                    $engine = new \Brick\Geo\Engine\PDOEngine($pdo);
                    $point  = $engine->centroid($engine->envelope($geometry));
                    return [(float)$point->y(), (float)$point->x()];
                }
            } catch (\Throwable $e) {
                error_log('[geoMetadata] brick/geo centroid failed, using fallback: ' . $e->getMessage());
            }
        }

        return self::fromBbox($bbox);
    }

    /**
     * Reduce a GeoJSONReader result (Geometry, Feature, or FeatureCollection)
     * to a single Geometry; multi-feature input becomes a GeometryCollection.
     * Returns null when no geometry is present.
     */
    private static function extractGeometry(object $parsed): ?\Brick\Geo\Geometry
    {
        if ($parsed instanceof \Brick\Geo\Geometry) {
            return $parsed;
        }
        if ($parsed instanceof \Brick\Geo\IO\GeoJSON\Feature) {
            return $parsed->getGeometry();
        }
        if ($parsed instanceof \Brick\Geo\IO\GeoJSON\FeatureCollection) {
            $geometries = [];
            foreach ($parsed->getFeatures() as $feature) {
                $g = $feature->getGeometry();
                if ($g !== null) {
                    $geometries[] = $g;
                }
            }
            if (count($geometries) === 0) {
                return null;
            }
            if (count($geometries) === 1) {
                return $geometries[0];
            }
            return \Brick\Geo\GeometryCollection::of(...$geometries);
        }
        return null;
    }

    /**
     * Midpoint of a {north, south, east, west} bbox object (the shape used
     * throughout this plugin for stored admin-unit bounding boxes).
     * `east < west` indicates a bbox that crosses the antimeridian — the
     * midpoint unwraps east across the dateline and wraps back into [-180, 180].
     *
     * @return array{0: float, 1: float} [lat, lon]
     */
    public static function fromBbox(object $bbox): array
    {
        $lat = ((float)$bbox->north + (float)$bbox->south) / 2.0;
        $west = (float)$bbox->west;
        $east = (float)$bbox->east;
        if ($east < $west) {
            $midUnwrapped = ($west + $east + 360.0) / 2.0;
            $lon = $midUnwrapped > 180.0 ? $midUnwrapped - 360.0 : $midUnwrapped;
        } else {
            $lon = ($east + $west) / 2.0;
        }
        return [$lat, $lon];
    }

    /**
     * Walk a decoded GeoJSON tree and return the envelope of every coordinate
     * pair, as a {north, south, east, west} object. `east < west` indicates
     * an antimeridian-crossing envelope (the cluster is separated from its
     * empty hemisphere by the widest longitudinal gap).
     * Returns null if no coordinates were found.
     */
    public static function bboxFromGeoJson($decoded): ?object
    {
        $bounds = ['n' => null, 's' => null, 'lngs' => []];
        self::collectBounds($decoded, $bounds);
        if ($bounds['n'] === null) {
            return null;
        }
        [$west, $east] = self::lngExtent($bounds['lngs']);
        return (object)[
            'north' => $bounds['n'],
            'south' => $bounds['s'],
            'east'  => $east,
            'west'  => $west,
        ];
    }

    /**
     * Recurse into a decoded GeoJSON node, walking into the `coordinates`
     * property of any {type, coordinates} geometry and descending through
     * FeatureCollection / Feature / GeometryCollection nodes.
     */
    private static function collectBounds($node, array &$bounds): void
    {
        if (is_object($node)) {
            if (isset($node->type, $node->coordinates)) {
                self::walkCoordinates($node->coordinates, $bounds);
                return;
            }
            foreach (get_object_vars($node) as $v) {
                self::collectBounds($v, $bounds);
            }
        } elseif (is_array($node)) {
            foreach ($node as $v) {
                self::collectBounds($v, $bounds);
            }
        }
    }

    /**
     * Recurse into a GeoJSON coordinates array. Leaves are `[lon, lat]` pairs
     * (optionally with an elevation at index 2), non-leaves are arrays of
     * sub-coordinate arrays (LineString, Polygon ring, MultiPolygon, …).
     */
    private static function walkCoordinates($coords, array &$bounds): void
    {
        if (!is_array($coords) || empty($coords)) {
            return;
        }
        if (is_numeric($coords[0]) && isset($coords[1]) && is_numeric($coords[1])) {
            self::addPoint((float)$coords[0], (float)$coords[1], $bounds);
            return;
        }
        foreach ($coords as $sub) {
            self::walkCoordinates($sub, $bounds);
        }
    }

    private static function addPoint(float $lon, float $lat, array &$bounds): void
    {
        $bounds['n'] = $bounds['n'] === null ? $lat : max($bounds['n'], $lat);
        $bounds['s'] = $bounds['s'] === null ? $lat : min($bounds['s'], $lat);
        $bounds['lngs'][] = $lon;
    }

    /**
     * Compute [west, east] from a list of longitudes, detecting an antimeridian-
     * crossing cluster via the widest-gap heuristic: if the largest "empty" arc
     * between consecutive sorted longitudes is bigger than the wrap arc
     * (360° − (max − min)), the cluster straddles ±180° and the returned
     * extent has east < west.
     *
     * @param float[] $lngs
     * @return array{0: float, 1: float}  [west, east]
     */
    private static function lngExtent(array $lngs): array
    {
        $n = count($lngs);
        if ($n === 0) {
            return [0.0, 0.0];
        }
        if ($n === 1) {
            return [$lngs[0], $lngs[0]];
        }
        sort($lngs);
        $wrap = 360.0 - ($lngs[$n - 1] - $lngs[0]);
        $maxGap = $wrap;
        $maxGapIdx = -1;
        for ($i = 0; $i < $n - 1; $i++) {
            $gap = $lngs[$i + 1] - $lngs[$i];
            if ($gap > $maxGap) {
                $maxGap = $gap;
                $maxGapIdx = $i;
            }
        }
        if ($maxGapIdx === -1) {
            return [$lngs[0], $lngs[$n - 1]];
        }
        return [$lngs[$maxGapIdx + 1], $lngs[$maxGapIdx]];
    }
}
