<?php
/**
 * @file classes/Geo/AntimeridianSplitter.inc.php
 *
 * Copyright (c) 2026 KOMET project, OPTIMETA project, Daniel Nüst
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class AntimeridianSplitter
 *
 * @brief Normalise GeoJSON so geometries crossing the 180° meridian are split
 *        into RFC 7946 §3.1.9-compliant Multi* features (one part per hemisphere).
 *
 * Called from GeoMetadataPlugin::editPublication on the write path so stored
 * spatialProperties are always unambiguous. Point/MultiPoint lngs are wrapped
 * into (-180, 180]. Non-crossing and already-split geometries pass through.
 * On any structural failure the input string is returned unchanged.
 */

namespace geoMetadata\classes\Geo;

class AntimeridianSplitter
{
    public static function splitGeoJson(string $geoJson): string
    {
        $decoded = json_decode($geoJson);
        if ($decoded === null || !is_object($decoded)) {
            return $geoJson;
        }
        try {
            self::walkRoot($decoded);
        } catch (\Throwable $e) {
            error_log('[geoMetadata] antimeridian split failed, keeping original: ' . $e->getMessage());
            return $geoJson;
        }
        $re = json_encode($decoded, JSON_UNESCAPED_SLASHES);
        return $re === false ? $geoJson : $re;
    }

    private static function walkRoot(object $root): void
    {
        if (!isset($root->type)) {
            return;
        }
        if ($root->type === 'FeatureCollection' && isset($root->features) && is_array($root->features)) {
            foreach ($root->features as $f) {
                if (is_object($f)) {
                    self::splitFeature($f);
                }
            }
        } elseif ($root->type === 'Feature') {
            self::splitFeature($root);
        } else {
            self::splitGeometry($root);
        }
    }

    private static function splitFeature(object $feature): void
    {
        if (!isset($feature->geometry) || !is_object($feature->geometry)) {
            return;
        }
        self::splitGeometry($feature->geometry);
    }

    private static function splitGeometry(object $geom): void
    {
        if (!isset($geom->type, $geom->coordinates)) {
            return;
        }
        switch ($geom->type) {
            case 'Point':
                if (is_array($geom->coordinates) && isset($geom->coordinates[0])) {
                    $geom->coordinates[0] = self::normalizeLng((float)$geom->coordinates[0]);
                }
                return;

            case 'MultiPoint':
                foreach ($geom->coordinates as $i => $pt) {
                    if (is_array($pt) && isset($pt[0])) {
                        $geom->coordinates[$i][0] = self::normalizeLng((float)$pt[0]);
                    }
                }
                return;

            case 'LineString':
                $parts = self::splitLine($geom->coordinates);
                if (count($parts) > 1) {
                    $geom->type = 'MultiLineString';
                    $geom->coordinates = $parts;
                } else {
                    $geom->coordinates = $parts[0];
                }
                return;

            case 'Polygon':
                $newRings = self::splitPolygonRings($geom->coordinates);
                if ($newRings === null) {
                    return;
                }
                if (count($newRings) > 1) {
                    $geom->type = 'MultiPolygon';
                    $geom->coordinates = array_map(function ($r) { return [$r]; }, $newRings);
                } else {
                    $geom->coordinates = [$newRings[0]];
                }
                return;

            case 'MultiLineString':
                $allParts = [];
                foreach ($geom->coordinates as $line) {
                    foreach (self::splitLine($line) as $part) {
                        $allParts[] = $part;
                    }
                }
                $geom->coordinates = $allParts;
                return;

            case 'MultiPolygon':
                $allPolys = [];
                foreach ($geom->coordinates as $poly) {
                    if (!is_array($poly)) {
                        continue;
                    }
                    $newRings = self::splitPolygonRings($poly);
                    if ($newRings === null) {
                        $allPolys[] = $poly;
                        continue;
                    }
                    foreach ($newRings as $r) {
                        $allPolys[] = [$r];
                    }
                }
                $geom->coordinates = $allPolys;
                return;

            case 'GeometryCollection':
                if (isset($geom->geometries) && is_array($geom->geometries)) {
                    foreach ($geom->geometries as $g) {
                        if (is_object($g)) {
                            self::splitGeometry($g);
                        }
                    }
                }
                return;
        }
    }

    /**
     * @param array $polyCoords [outerRing, innerRing1, ...] where each ring is [[lng,lat], ...]
     * @return array[]|null  list of rings, each closed; null if the shape cannot be split safely
     */
    private static function splitPolygonRings(array $polyCoords): ?array
    {
        if (empty($polyCoords) || !is_array($polyCoords[0])) {
            return null;
        }
        $outer = $polyCoords[0];
        $parts = self::splitLine($outer);
        if (count($parts) === 1) {
            return [$parts[0]];
        }
        // Canonical ring-crossing: outer closed ring crosses twice → splitLine produces
        // 3 parts (head-east, middle-west, tail-east). Glue head+tail into one ring.
        if (count($parts) < 3 || count($parts) % 2 === 0) {
            error_log('[geoMetadata] antimeridian split: unsupported ring shape with ' . count($parts) . ' parts, keeping original');
            return null;
        }
        $head = $parts[0];
        $tail = $parts[count($parts) - 1];
        $merged = array_merge($tail, array_slice($head, 1));
        $merged[] = $merged[0];
        $rings = [$merged];
        for ($i = 1; $i < count($parts) - 1; $i++) {
            $r = $parts[$i];
            $r[] = $r[0];
            $rings[] = $r;
        }
        if (count($polyCoords) > 1) {
            error_log('[geoMetadata] antimeridian split: polygon has inner rings, dropped in split output');
        }
        return $rings;
    }

    /**
     * Normalise all lngs to (-180, 180]; where two consecutive lngs differ by
     * more than 180° insert an interpolated vertex on ±180 and start a new part.
     *
     * @param array $coords [[lng, lat], ...]
     * @return array[]  at least one element; more than one when the line crosses.
     */
    private static function splitLine(array $coords): array
    {
        if (count($coords) < 2) {
            if (!empty($coords) && is_array($coords[0]) && isset($coords[0][0])) {
                $coords[0][0] = self::normalizeLng((float)$coords[0][0]);
            }
            return [$coords];
        }
        $pts = [];
        foreach ($coords as $p) {
            $pts[] = [self::normalizeLng((float)$p[0]), (float)$p[1]];
        }
        $parts = [];
        $current = [$pts[0]];
        for ($i = 1, $n = count($pts); $i < $n; $i++) {
            $a = $pts[$i - 1];
            $b = $pts[$i];
            $dLng = $b[0] - $a[0];
            if (abs($dLng) > 180.0) {
                $lngSign = $a[0] >= 0 ? 180.0 : -180.0;
                $unwrappedB = $b[0] + ($dLng > 0 ? -360.0 : 360.0);
                $span = $unwrappedB - $a[0];
                $frac = $span == 0.0 ? 0.5 : (($lngSign - $a[0]) / $span);
                $lat = $a[1] + ($b[1] - $a[1]) * $frac;
                $current[] = [$lngSign, $lat];
                $parts[] = $current;
                $current = [[-$lngSign, $lat], $b];
            } else {
                $current[] = $b;
            }
        }
        $parts[] = $current;
        return $parts;
    }

    /**
     * Values already in [-180, 180] pass through unchanged so split output
     * with -180 on one part and +180 on another stays idempotent on re-split.
     * Out-of-range lngs (Leaflet post-drag values like 190 or -190) wrap into (-180, 180].
     */
    private static function normalizeLng(float $lng): float
    {
        if ($lng >= -180.0 && $lng <= 180.0) {
            return $lng;
        }
        $x = fmod($lng + 180.0, 360.0);
        if ($x <= 0.0) {
            $x += 360.0;
        }
        return $x - 180.0;
    }
}
