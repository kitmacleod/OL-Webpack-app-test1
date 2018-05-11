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


// Workshop code 
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new XYZSource({
        url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
       })
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

// Draw current location uses default ol.style
const position = new VectorSource();
const vector = new VectorLayer({
  source: position
});


map.addLayer(vector);



// Geolocation functionality
// Maybe print this
navigator.geolocation.getCurrentPosition(function(pos) {
  const coords = proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]);
  map.getView().animate({center: coords, zoom: 10});
  position.addFeature(new Feature(new Point(coords)));
});

// Mouse position
var mousePositionControl = new MousePosition({
  coordinateFormat: Coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position', //not sure needed
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});
map.addControl(mousePositionControl);





