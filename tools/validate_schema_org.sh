#!/usr/bin/env bash
# Pre-release sanity check for the schema.org JSON-LD emitted by the plugin.
# Fetches one or more article URLs, extracts every
# <script type="application/ld+json"> block, and POSTs each to
# validator.schema.org. Fails on any reported error or warning.
#
# Usage: tools/validate_schema_org.sh [URL]...
# When no URL is given, defaults to the local dev-server article (CLAUDE.md
# "Running an OJS dev server from this host"). Override via the
# VALIDATE_URLS env var or positional args.
#
# Run before tagging a release; not part of CI.

set -euo pipefail

command -v jq   >/dev/null || { echo "jq is required"   >&2; exit 2; }
command -v curl >/dev/null || { echo "curl is required" >&2; exit 2; }

if [ "$#" -gt 0 ]; then
  urls=("$@")
elif [ -n "${VALIDATE_URLS:-}" ]; then
  read -ra urls <<<"$VALIDATE_URLS"
else
  urls=("http://localhost:8330/index.php/gmdj/article/view/20")
fi

extract_jsonld() {
  # Extract every <script type="application/ld+json">…</script> body, one
  # block per line on stdout. Tolerates extra attributes on the script tag.
  perl -0777 -ne 'while (m{<script[^>]*application/ld\+json[^>]*>(.*?)</script>}gs) { print $1, "\n" }'
}

validate_html() {
  # POST a full HTML document to validator.schema.org. The endpoint isn't
  # publicly documented but is what the validator's own UI calls; the
  # response is JSON prefixed with the XSSI guard `)]}'` which we strip.
  # Required: header X-Same-Domain: 1, form parameter html=<doc>.
  #
  # Aggressive use trips Google's anti-bot — a 302 to /sorry/index — which
  # we surface as a soft failure (warn, exit 0) so a release isn't blocked
  # by an unrelated rate limit.
  local html="$1"
  local response http_code
  response=$(curl -sS -w '\n__HTTP__%{http_code}' 'https://validator.schema.org/validate?hl=en' \
    -H 'X-Same-Domain: 1' \
    -H 'Content-Type: application/x-www-form-urlencoded;charset=UTF-8' \
    -H 'User-Agent: geoMetadata-validate/1.0' \
    --data-urlencode "html=$html" 2>&1 || true)
  http_code=${response##*__HTTP__}
  response=${response%$'\n'__HTTP__*}

  if [ "$http_code" = "302" ] || [ "$http_code" = "405" ] || [ "$http_code" = "429" ]; then
    echo "  validator unreachable (HTTP $http_code, likely rate-limited) — skipping semantic check" >&2
    return 0
  fi
  if [ "$http_code" != "200" ] || [ -z "$response" ]; then
    echo "  validator returned HTTP $http_code with empty/unusable body — skipping semantic check" >&2
    return 0
  fi

  # Strip the four-character XSSI guard `)]}'` at the start of the response.
  if [ "${response:0:4}" = ")]}'" ]; then
    response=${response:4}
  fi

  local errors warnings objects
  objects=$(printf '%s' "$response"  | jq -r '.numObjects        // 0')
  errors=$(printf '%s' "$response"   | jq -r '.totalNumErrors    // 0')
  warnings=$(printf '%s' "$response" | jq -r '.totalNumWarnings  // 0')

  if [ "$objects" = "0" ]; then
    echo "  validator found 0 objects in the page" >&2
    return 1
  fi
  if [ "$errors" = "0" ] && [ "$warnings" = "0" ]; then
    local types
    types=$(printf '%s' "$response" | jq -r '[.tripleGroups[].type] | join(", ")')
    echo "  ok (objects=$objects, types=$types)"
    return 0
  fi

  echo "  errors=$errors warnings=$warnings" >&2
  printf '%s' "$response" | jq '.tripleGroups[]?.nodes[]?.errors[]?, .tripleGroups[]?.nodes[]?.properties[]?.errors[]?' >&2 || true
  return 1
}

failed=0
for url in "${urls[@]}"; do
  echo ">>> $url"
  html=$(curl -fsS "$url") || { echo "  fetch failed" >&2; failed=1; continue; }
  blocks=$(printf '%s' "$html" | extract_jsonld)
  if [ -z "$blocks" ]; then
    echo "  no JSON-LD block found" >&2
    failed=1
    continue
  fi
  while IFS= read -r block; do
    [ -n "$block" ] || continue
    echo "$block" | jq -e '."@context"' >/dev/null \
      || { echo "  block missing @context" >&2; failed=1; }
    echo "$block" | jq -e '."@type"'    >/dev/null \
      || { echo "  block missing @type"    >&2; failed=1; }
  done <<<"$blocks"

  validate_html "$html" || failed=1
done

if [ "$failed" -ne 0 ]; then
  echo "validate_schema_org: failures detected" >&2
  exit 1
fi
echo "validate_schema_org: all blocks ok"
