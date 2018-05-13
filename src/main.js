import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZSource from 'ol/source/xyz';
import proj from 'ol/proj';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Overlay from 'ol/overlay';
import Coordinate from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';
import GeoJSON from 'ol/format/geojson';
import sync from 'ol-hashed';
import Draw from 'ol/interaction/draw';
import Style from 'ol/style/style';




// Define tile layers
const tile = new TileLayer({
  source: new XYZSource({
    url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
  })
});

// Define vector layer
const vector = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson'
  })
});

// Define draw layer

// // Adding draw
// const source = new VectorSource();
// map.addInteraction(new Draw({
//   type:'Polygon',
//   source: source
// }));

const drawSource = new VectorSource();
const draw = new VectorLayer({
  source: drawSource,
  style: new 
})

// need to add style here 


// Simple test
const map = new Map({
  target: 'map',
  layers: [tile, vector],
  view: new View({
    center: [0,0],
    zoom: 2
  })
});


// // Workshop code 
// const map = new Map({
//   target: 'map',
//   layers: [
//     new TileLayer({
//       source: new XYZSource({
//         url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
//        })
//     }),
//     new VectorLayer({
//       source: new VectorSource({
//         format: new GeoJSON(),
//         url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson'
//       })
//     })
//   ],
//   view: new View({
//     center: [0, 0],
//     zoom: 2
//   })
// });

// // Draw current location uses default ol.style
// const position = new VectorSource();
// const vector = new VectorLayer({
//   source: position
// });

// map.addLayer(vector);

// // Synchronise the map view with the URL hash
// sync(map);


// // Geolocation functionality
// // Maybe print this
// navigator.geolocation.getCurrentPosition(function(pos) {
//   const coords = proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]);
//   map.getView().animate({center: coords, zoom: 4});
//   position.addFeature(new Feature(new Point(coords)));
// });

// // Mouse position
// var mousePositionControl = new MousePosition({
//   coordinateFormat: Coordinate.createStringXY(4),
//   projection: 'EPSG:4326',
//   className: 'custom-mouse-position', //not sure needed
//   target: document.getElementById('mouse-position'),
//   undefinedHTML: '&nbsp;'
// });
// map.addControl(mousePositionControl);

// // Linking mouse position to form
// var projectionSelect = document.getElementById('projection');
// projectionSelect.addEventListener('change', function(event) {
//   mousePositionControl.setProjection(event.target.value);
// });

// var precisionInput = document.getElementById('precision');
// precisionInput.addEventListener('change', function(event) {
//   var format = Coordinate.createStringXY(event.target.valueAsNumber);
//   mousePositionControl.setCoordinateFormat(format);
// });

// // Adding draw
// const source = new VectorSource();
// map.addInteraction(new Draw({
//   type:'Polygon',
//   source: source
// }));

