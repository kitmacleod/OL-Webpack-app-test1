import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import {Draw, Modify, Snap} from 'ol/interaction';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'; 
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import {createStringXY} from 'ol/coordinate';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Coordinate from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';
import GeoJSON from 'ol/format/geojson';
import sync from 'ol-hashed';

import 'normalize.css/normalize.css';
import './styles/styles.scss';

// Define raster layers
const raster = new TileLayer({
  source: new OSM
});

// Define vector layer, comment this out
const vector = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson'
  })
});

// Define draw layer
const drawSource = new VectorSource();
const drawLayer = new VectorLayer({
  source: drawSource,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33'
        })
      }) 
    })
  });

  // currentLocation: draw current location uses default ol.style
const position = new VectorSource();
const currentPosition = new VectorLayer({
  source: position
});

// Geolocation functionality
// Maybe print this
navigator.geolocation.getCurrentPosition(function(pos) {
  const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
  map.getView().animate({center: coords, zoom: 4});
  position.addFeature(new Feature(new Point(coords)));
});

// small change


// Simple map object with array of layers
const map = new Map({
  target: 'map-container',
  layers: [raster, currentPosition, drawLayer],
  view: new View({
    center: [0,0],
    zoom: 2
  })

});

// Synchronise the map view with the URL hash
// This was causing a type error (stack back to ol-hashed) 
// sync(map);

// Draw and modify
const modify = new Modify({source: drawSource});
map.addInteraction(modify);

let draw, snap;
const typeSelect = document.getElementById('type');

function addInteractions() {
  draw = new Draw({
    source: drawSource,
    type: typeSelect.value
  });
  map.addInteraction(draw);
  snap = new Snap({source: drawSource});
  map.addInteraction(snap);
}
typeSelect.onchange = function() {
  map.removeInteraction(draw);
  map.removeInteraction(snap);
  addInteractions();
};

addInteractions();


// Mouse position
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position', //not sure needed
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});
map.addControl(mousePositionControl);

// Linking mouse position to form
const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function(event) {
  mousePositionControl.setProjection(event.target.value);
});

const precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function(event) {
  const format = createStringXY(event.target.valueAsNumber);
  mousePositionControl.setCoordinateFormat(format);
});




