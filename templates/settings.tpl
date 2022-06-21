{*template settings for the geo plugin.'*}
<script>
    $(function() {ldelim}
    $('#optimetaGeoSettings').pkpHandler('$.pkp.controllers.form.AjaxFormHandler');
    {rdelim});
</script>

<form class="pkp_form" id="optimetaGeoSettings" method="POST"
    action="{url router=$smarty.const.ROUTE_COMPONENT op="manage" category="generic" plugin=$pluginName verb="settings" save=true}">
    <!-- Always add the csrf token to secure your form -->
    {csrf}

    {fbvFormArea}
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.optimetaGeo.settings.usernameGeonames.description"}
        {fbvElement
        type="text"
        id="optimetaGeo_geonames_username"
        value=$optimetaGeo_geonames_username
        label="plugins.generic.optimetaGeo.settings.usernameGeonames"
        }
    </p>
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">
        {translate key="plugins.generic.optimetaGeo.settings.baseurlGeonames.description"}
        {fbvElement
        type="text"
        id="optimetaGeo_geonames_baseurl"
        value=$optimetaGeo_geonames_baseurl
        label="plugins.generic.optimetaGeo.settings.baseurlGeonames"
        }
    </p>
    {/fbvFormSection}
    {/fbvFormArea}
    {fbvFormButtons submitText="common.save"}
</form>
