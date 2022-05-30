/**
 * Script imported in the plugin main file to display spatio-temporal metadata in the issue view. 
 */

// create map 
var map = L.map('mapdiv');

var osmlayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
});

var baseLayers = {
    "OpenStreetMap": osmlayer,
    "Esri World Imagery": Esri_WorldImagery
};

// add scale to the map 
L.control.scale({ position: 'bottomright' }).addTo(map);

// FeatureGroup for the geospatial extent of articles
var articleLocations = new L.FeatureGroup();
map.addLayer(articleLocations);

// FeatureGroup for the administrativeUnits 
//var administrativeUnitsMap = new L.FeatureGroup();
//map.addLayer(administrativeUnitsMap);

var overlayMaps = {
    "article locations": articleLocations,
    //"administrative unit": administrativeUnitsMap
};

// add layerControl to the map to the map 
L.control.layers(baseLayers, overlayMaps).addTo(map);

// highlighting features based on https://leafletjs.com/examples/choropleth/
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: 'red',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    // TODO use e.options.articleId to highlight article in the list
    $('#' + layer.options.articleId).parent().closest('div').addClass('optimetageo_title_hover');
}

function resetHighlight(e) {
    // e.target.resetStyle(); // e's layers is a geoJSON layer, so maybe access that function here somehow?
    var layer = e.target;

    layer.setStyle(mapLayerStyle);
    $('#' + layer.options.articleId).parent().closest('div').removeClass('optimetageo_title_hover');
}

// load spatial data
$(function () {
    // load properties for each article from issue_map.tpl
    var spatialInputs = $('.optimeta_data.spatial').toArray().map(input => {
        let geojson = JSON.parse(input.value);
        return(geojson);
    });
    var articleIdInputs = $('.optimeta_data.articleId').toArray().map(input => {
        return(input.value);
    });
    var popupInputs = $('.optimeta_data.popup').toArray().map(input => {
        return(input.value);
    });
    //var tooltipInputs = $('.optimeta_data.tooltip').toArray().map(input => {
    //    return(input.value);
    //});

    spatialInputs.forEach((spatialProperty, index) => {
        let layer = L.geoJSON(spatialProperty, {
            onEachFeature: function(feature, layer) {
                layer.bindPopup(popupInputs[index]);
                //layer.bindTooltip(tooltipInputs[index]);
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                });
            },
            style: mapLayerStyle,
            articleId: articleIdInputs[index]
        });
        articleLocations.addLayer(layer);
        map.fitBounds(articleLocations.getBounds());
    });

    /*
    var administrativeUnitDecoded = document.getElementById("optimeta_administrativeUnit").value;
    var administrativeUnitEncoded = JSON.parse(administrativeUnitDecoded);

    var administrativeUnitsNameList = [];

    for (var i = 0; i < administrativeUnitEncoded.length; i++) {
        administrativeUnitsNameList.push(administrativeUnitEncoded[i].name);
    }

    document.getElementById("administrativeUnit").innerHTML = administrativeUnitsNameList.join(', ');

    var spatialPropertiesEncoded = JSON.parse(spatialPropertiesDecoded);
    displayBboxOfAdministrativeUnitWithLowestCommonDenominatorOfASetOfAdministrativeUnitsGivenInAGeojson(spatialPropertiesEncoded);
    */
});

/*
$(function () {
    // load temporal properties from article_details.tpl 
    var temporalPropertiesDecoded = document.getElementById("optimeta_temporal").value;

});
*/
