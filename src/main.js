import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZSource from 'ol/source/xyz';

// Workshop code 
new Map({
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