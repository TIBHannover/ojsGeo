{**
 * templates/frontend/objects/schema_org_jsonld.tpl
 *
 * Emit a pre-built schema.org JSON-LD <script> tag. The variable holds the
 * full <script type="application/ld+json">…</script> markup produced by
 * spatie/schema-org's toScript().
 *}
{if isset($geoMetadata_schemaOrgScript) && $geoMetadata_schemaOrgScript}
{$geoMetadata_schemaOrgScript}
{/if}
