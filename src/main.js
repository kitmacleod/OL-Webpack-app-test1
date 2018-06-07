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

import * as vega from 'vega';

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
  // add comment

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

// Vega figure
let loader = {
  load : function(){
      return new Promise((resolve,reject) => {

          let values = [
              {"category": "A", "amount": 28},
              {"category": "B", "amount": 55},
              {"category": "C", "amount": 43},
              {"category": "D", "amount": 91},
              {"category": "E", "amount": 81},
              {"category": "F", "amount": 53},
              {"category": "G", "amount": 19},
              {"category": "H", "amount": 87}
          ];

          let wait = setTimeout(() => {
              clearTimeout(wait);

              resolve (values);

          }, 2000);

      })
  }
};

let vegaJSONSpec = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "width": 400,
  "height": 200,
  "padding": 5,

  "data": [
      {
          "name": "table",
          "url": "table.json"
      }
  ],

  "signals": [
      {
          "name": "tooltip",
          "value": {},
          "on": [
              {"events": "rect:mouseover", "update": "datum"},
              {"events": "rect:mouseout",  "update": "{}"}
          ]
      }
  ],

  "scales": [
      {
          "name": "xscale",
          "type": "band",
          "domain": {"data": "table", "field": "category"},
          "range": "width"
      },
      {
          "name": "yscale",
          "domain": {"data": "table", "field": "amount"},
          "nice": true,
          "range": "height"
      }
  ],

  "axes": [
      { "orient": "bottom", "scale": "xscale" },
      { "orient": "left", "scale": "yscale" }
  ],

  "marks": [
      {
          "type": "rect",
          "from": {"data":"table"},
          "encode": {
              "enter": {
                  "x": {"scale": "xscale", "field": "category", "offset": 1},
                  "width": {"scale": "xscale", "band": 1, "offset": -1},
                  "y": {"scale": "yscale", "field": "amount"},
                  "y2": {"scale": "yscale", "value": 0}
              },
              "update": {
                  "fill": {"value": "steelblue"}
              },
              "hover": {
                  "fill": {"value": "red"}
              }
          }
      },
      {
          "type": "text",
          "encode": {
              "enter": {
                  "align": {"value": "center"},
                  "baseline": {"value": "bottom"},
                  "fill": {"value": "#333"}
              },
              "update": {
                  "x": {"scale": "xscale", "signal": "tooltip.category", "band": 0.5},
                  "y": {"scale": "yscale", "signal": "tooltip.amount", "offset": -2},
                  "text": {"signal": "tooltip.amount"},
                  "fillOpacity": [
                      {"test": "datum === tooltip", "value": 0},
                      {"value": 1}
                  ]
              }
          }
      }
  ]
};


let options = {
  loader:loader,
  logLevel: vega.Warn,
  renderer: 'svg'
};


let view = new vega.View(vega.parse(vegaJSONSpec),options)
  .initialize('#view') // initialize view within parent DOM container
  .hover()             // enable hover encode set processing
  .run();              // run the dataflow and render the view





