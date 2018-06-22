import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import {Draw, Modify, Snap} from 'ol/interaction';
// import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile.js';
import VectorSource from 'ol/source/Vector'; 
// import {OSM, Vector as VectorSource} from 'ol/source';
import OSM from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import {createStringXY} from 'ol/coordinate';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import LineString from 'ol/geom/linestring';
import Coordinate from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';
import GeoJSON from 'ol/format/geojson';
import sync from 'ol-hashed';
import * as vega from 'vega';
import 'normalize.css/normalize.css';
import './styles/styles.scss';



// // Define raster layers (210618  causing an error) 
// const raster = new TileLayer({
//   source: new OSM()
// });

// // Define vector layer, comment this out
// // const vector = new VectorLayer({
// //   source: new VectorSource({
// //     format: new GeoJSON(),
// //     url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson'
// //   })
// // });

// Define draw layer
const drawSource = new VectorSource();
const drawLayer = new VectorLayer({
  source: drawSource,
  zIndex: 2,
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

// GeoJSON layer
// I may need to set style (see example http://openlayers.org/en/beta/examples/vector-layer.html?q=geojson )


// // Working OL code
// new Map({
//   target: 'map-container',
//   layers: [
//     new VectorLayer({
//       source: new VectorSource({
//         format: new GeoJSON(),
//         url: './data/countries.json'
//       })
//     })
//   ],
//   view: new View({
//     center: [0, 0],
//     zoom: 2
//   })
// });




//

const countryLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: './data/countries.json'
  
  }),
  // style: function(feature) {
  //   style.getText().setText(feature.get('name'));
  //   return style;
  // }, 
  zIndex: 1
});

// small change
// Simple map object with array of layers
const map = new Map({
  target: 'map-container',
  layers: [currentPosition, drawLayer, countryLayer],
  // layers: [countryLayer],
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


// Jontas fiddle add vars NOT WORKING
// var vectorSource = new VectorSource();
// var vectorLayer = new VectorLayer({
//   source: vectorSource });
//   map.addLayer(vectorLayer);
// var coords_element = document.getElementById('coords');
// var coords_length = 0;


 function addInteractions() {
   draw = new Draw({
     source: drawSource,
     type: typeSelect.value,
     // Jontas  fiddle NOT WORKING 
//     geometryFunction: function (coords, geom) {
//       if (!geom) geom = new
//       LineString(null);
//       geom.setCoordinates(coords);
//       //if linestring changed
//       if(coords.length !== coords_length) {
//         coords_length = coords.length;
//         coords_element.innerHTML = coords.join('<br>');
//       }
//       return geom;

    // }
   });
   map.addInteraction(draw);

// Jonatas fiddle code for feature console NOT WORKING

// var feature;

// draw.on('drawend', function(evt) {
//   console.infor('drawend');
//   //console.info(evt);
//   feature = evt.feature;
// });
// vectorSource.on('addfeature', 
// function(evt) {
//   console.info('addfeature');
//   console.info(evt);
//   console.info(evt.feature === feature);
// });


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
              {"category": "A", "value": 28},
              {"category": "B", "value": 55},
              {"category": "C", "value": 43},
              {"category": "D", "value": 91},
              {"category": "E", "value": 81},
              {"category": "F", "value": 53},
              {"category": "G", "value": 19},
              {"category": "H", "value": 87}
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
    {"events": "rect:mouseout", "update": "{}"}
    ]
    }
    ],
    
    
    
    "scales": [
      {
        "name": "y",
        "type": "band",
        "domain": {"data": "table", "field": "category"},
        "range": "height",
        "padding": 0.2
      },
      {
        "name": "x",
        "type": "linear",
        "domain": {"data": "table", "field": "value"},
        "range": "width"
      }
    
    ],
    
    "axes": [
      {"orient": "left", "scale": "y", "tickSize": 0, "labelPadding": 4, "zindex": 1},
      {"orient": "bottom", "scale": "x"}
    ],
    
    "marks": [
      {
        "type": "rect",
        "from": {"data": "table"},
        "encode":  {
          "enter": {
            "y": {"scale": "y", "field": "category"},
            "height": {"scale":"y", "band": 1},
            "x": {"scale": "x", "field": "value"},
            "x2": {"scale": "x", "value": 0}
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
    "x": {"scale": "x", "signal": "tooltip.value", "offset": 10},
    "y": {"scale": "y", "signal": "tooltip.category", "band": 0.5},
    "text": {"signal": "tooltip.value"},
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



