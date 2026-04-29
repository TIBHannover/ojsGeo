.PHONY: validate_schema_org

# URLs to validate. Defaults to one article on the local dev server (see
# CLAUDE.md "Running an OJS dev server from this host"); override with:
# make validate_schema_org VALIDATE_URLS="http://… http://…"
VALIDATE_URLS ?=

# Pre-release sanity check for schema.org JSON-LD emission. Fetches each URL,
# extracts every <script type="application/ld+json"> block, and POSTs it to
# validator.schema.org. Fails on any error or warning. Run before tagging a
# release; not part of CI.
validate_schema_org:
	@VALIDATE_URLS="$(VALIDATE_URLS)" tools/validate_schema_org.sh
