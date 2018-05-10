import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZSource from 'ol/source/xyz';

// Workshop code maybe not working here (or another reason)
// new Map({
//   target: 'map',
//   layers: [
//     new TileLayer({
//       source: new XYZSource({
//         url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
//        })
//     })
//   ],
//   view: new View({
//     center: [0, 0],
//     zoom: 2
//   })
// });

var map = new ol.map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([37.41, 8.82]),
    zoom: 4
  })
});