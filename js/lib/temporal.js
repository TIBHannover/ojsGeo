/**
 * js/lib/temporal.js
 *
 * Copyright (c) 2025 KOMET project, OPTIMETA project, Daniel Nüst, Tom Niers
 * Distributed under the GNU GPL v3. For full terms see the file LICENSE.
 *
 * @brief Shared parser and aggregator for stored time-period strings.
 *
 * Stored format is `{start..end}` where each side is one of:
 *   - bare year         e.g.  2020  or  -10000  (BCE)
 *   - year-month        e.g.  2020-06
 *   - full ISO date     e.g.  2020-06-15
 * A value may contain multiple concatenated `{…}` ranges (forward-compat
 * with #57 multi-period). Comparison is numeric so mixed widths / BCE
 * values sort chronologically. Missing month/day in a side expand to
 * Jan 1 for start-sides and Dec 31 for end-sides.
 */

(function (global) {
    var BLOCK_RE = /\{([^{}]+)\}/g;
    var DAY_RE   = /^(-?\d+)-(\d{2})-(\d{2})$/;
    var MONTH_RE = /^(-?\d+)-(\d{2})$/;
    var YEAR_RE  = /^(-?\d+)$/;

    function parseSide(s, isEnd) {
        s = s.trim();
        var m;
        if ((m = DAY_RE.exec(s))) {
            var mo = +m[2], d = +m[3];
            if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
            return { year: +m[1], month: mo, day: d, precision: 'day', raw: s };
        }
        if ((m = MONTH_RE.exec(s))) {
            var mo2 = +m[2];
            if (mo2 < 1 || mo2 > 12) return null;
            return { year: +m[1], month: mo2, day: isEnd ? 31 : 1, precision: 'month', raw: s };
        }
        if ((m = YEAR_RE.exec(s))) {
            return { year: +m[1], month: isEnd ? 12 : 1, day: isEnd ? 31 : 1, precision: 'year', raw: s };
        }
        return null;
    }

    function cmp(a, b) {
        if (a.year !== b.year) return a.year < b.year ? -1 : 1;
        if (a.month !== b.month) return a.month < b.month ? -1 : 1;
        if (a.day !== b.day) return a.day < b.day ? -1 : 1;
        return 0;
    }

    function warn(msg, arg) {
        if (typeof console !== 'undefined' && console.warn) console.warn(msg, arg);
    }

    function parseTimePeriods(raw) {
        if (raw == null || raw === '' || raw === 'no data') return [];
        var out = [];
        var m;
        BLOCK_RE.lastIndex = 0;
        while ((m = BLOCK_RE.exec(raw)) !== null) {
            var parts = m[1].split('..');
            if (parts.length !== 2) { warn('geoMetadata: skipped malformed time period', m[0]); continue; }
            var s = parseSide(parts[0], false);
            var e = parseSide(parts[1], true);
            if (!s || !e) { warn('geoMetadata: skipped malformed time period', m[0]); continue; }
            if (cmp(s, e) > 0) { var t = s; s = e; e = t; }
            out.push({ start: s.raw, end: e.raw });
        }
        if (out.length === 0 && raw.length > 0 && raw !== 'no data') {
            warn('geoMetadata: no parseable time period in value', raw);
        }
        return out;
    }

    function aggregateRange(rawValues) {
        var minD = null, maxD = null;
        for (var i = 0; i < rawValues.length; i++) {
            var ranges = parseTimePeriods(rawValues[i]);
            for (var j = 0; j < ranges.length; j++) {
                var s = parseSide(ranges[j].start, false);
                var e = parseSide(ranges[j].end, true);
                if (minD === null || cmp(s, minD) < 0) minD = s;
                if (maxD === null || cmp(e, maxD) > 0) maxD = e;
            }
        }
        if (minD === null || maxD === null) return null;
        return { minStart: minD.raw, maxEnd: maxD.raw };
    }

    function yearOf(s) {
        var m = /^(-?\d+)(?:-|$)/.exec((s || '').trim());
        return m ? m[1] : '';
    }

    // used by the submission form for inline validation; returns true if the
    // string is one of: -?digits, -?YYYY-MM, -?YYYY-MM-DD.
    function validateSide(s) {
        return parseSide(s, false) !== null;
    }

    global.geoMetadataTemporal = {
        parseTimePeriods: parseTimePeriods,
        aggregateRange: aggregateRange,
        yearOf: yearOf,
        validateSide: validateSide
    };
})(window);
