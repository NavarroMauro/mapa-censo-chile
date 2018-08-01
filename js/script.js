// Center point of the map and zoom level
var map = L.map('map', {
  center: [-40.5, -60.7],
  zoom: 4,
  scrollWheelZoom: false
});

// Links to GitHub repo and data source credit
map.attributionControl
.setPrefix(
  '<a href="http://github.com/jackdougherty/leaflet-map-polygon-hover">open-source code on GitHub</a>, created with <a href="http://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>'
);
map.attributionControl.addAttribution(
  'Instituto Nacional de Estadísticas (INE) &copy; <a href="https://www.censo2017.cl/">Datos Censo Chile - 2017</a>'
);

// Basemap layer
new L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
}).addTo(map);

// GeoJSON file from local directory
$.getJSON("regiones.geojson", function (data) {
  geoJsonLayer = L.geoJson(data, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
});

// Ranges and colors; more (http://colorbrewer.org)
// Not listed in the ranges below displays as the last color
function getColor (d) {
  
 return d > 5000000 ? '#800026' :
        d > 2000000 ? '#BD0026' :
        d > 1800000 ? '#E31A1C' :
        d > 700000 ? '#FC4E2A' :
        d > 500000 ? '#FD8D3C' :
        d > 300000 ? '#FEB24C' :
        d > 200000 ? '#FED976' :
                     '#FFEDA0';
}

// getColor property to match data column header in your GeoJson file
function style(feature) {
  return {
    fillColor: getColor(feature.properties.PERSONAS),
    weight: 0.5,
    opacity: 0.5,
    color: 'black',
    fillOpacity: 0.5
  };
}

// This highlights the layer on hover, also for mobile
function highlightFeature(e) {
  resetHighlight(e);
  var layer = e.target;
  layer.setStyle({
    weight: 2,
    color: 'red',
    fillOpacity: 1
  });
  info.update(layer.feature.properties);
}

// This resets the highlight after hover moves away
function resetHighlight(e) {
  geoJsonLayer.setStyle(style);
  info.update();
}

// This instructs highlight and reset functions on hover movement
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: highlightFeature
  });
}

// Info box on the map
var info = L.control();
info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

// Edit info box text and variables to match those the GeoJSON data
info.update = function (props) {
  this._div.innerHTML = '<h4>CENSO 2017 - CHILE</h4>' +  (props ?
    '<b>' + props.REGION_NAME + '</b><br/>' + props.PERSONAS.toLocaleString() + ' Población Total' + '<br/>' +
    props.HOMBRES.toLocaleString() + ' Total Hombres' + '<br/>' +
    props.MUJERES.toLocaleString() + ' Total Mujeres' + '<br/>' +
    props.INMIGRANTES.toLocaleString() + ' Población Inmigrantes' + '<br/>' +
    props.TOTAL_VIV.toLocaleString() + ' Total de viviendas censadas'
    : 'Pasa el mouse sobre una region para ver detalles');
};
info.addTo(map);

// Edit grades in legend to match the ranges cutoffs inserted above
// Here, the last grade will appear as 5000000+
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 200000, 300000, 500000, 700000, 1800000, 2000000, 5000000],
    labels = ['<strong> POBLACION </strong>'],
    from, to;
  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];
    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? ' &ndash; ' + to : ' +'));
  }
  div.innerHTML = 
  labels.join('<br>');
  return div;
};
legend.addTo(map);

// Use in info.update if GeoJSON data contains null values, and if so, displays "--"
function checkNull(val) {
  if (val != null || val == "NaN") {
    return comma(val);
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed as a percentage
function checkThePct(a,b) {
  if (a != null && b != null) {
    return Math.round(a/b*1000)/10 + "%";
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed with commas (such as 123,456)
function comma(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}
