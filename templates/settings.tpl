{*template which creates settings for the geoOJS plugin.'*}
<script>
    $(function() {ldelim}
    $('#tutorialExampleSettings').pkpHandler('$.pkp.controllers.form.AjaxFormHandler');
    {rdelim});
</script>

<form class="pkp_form" id="tutorialExampleSettings" method="POST"
    action="{url router=$smarty.const.ROUTE_COMPONENT op="manage" category="generic" plugin=$pluginName verb="settings" save=true}">
    <!-- Always add the csrf token to secure your form -->
    {csrf}

    {fbvFormArea}
    {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)">{translate
        key="plugins.generic.geoOJS.settings.usernameGeonames.description"}
        {fbvElement
        type="text"
        id="usernameGeonames"
        value=$usernameGeonames
        label="plugins.generic.geoOJS.settings.usernameGeonames"
        }
        {/fbvFormSection}
        {fbvFormSection list=true}
    <p align="justify" class="description" style="color: rgba(0,0,0,0.54)"> {translate
            key="plugins.generic.geoOJS.settings.CDN.description"}
        {fbvElement
            type="checkbox"
            id="checkboxDisableCDN"
            checked=$checkboxDisableCDN
            label="plugins.generic.geoOJS.settings.CDN"
            }
        {/fbvFormSection}
        {/fbvFormArea}
        {fbvFormButtons submitText="common.save"}
</form>
