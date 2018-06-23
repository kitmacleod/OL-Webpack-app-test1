import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import {Draw, Modify, Snap} from 'ol/interaction';
// import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
// import VectorLayer from 'ol/layer/Vector';
// import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector'; 
// import {OSM, Vector as VectorSource} from 'ol/source';
import OSM from 'ol/source/OSM';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import {createStringXY} from 'ol/coordinate';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
// import LineString from 'ol/geom/linestring';
import Coordinate from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';
import GeoJSON from 'ol/format/geojson';
import sync from 'ol-hashed';
import * as vega from 'vega';
import 'normalize.css/normalize.css';
import './styles/styles.scss';
import {unByKey} from 'ol/Observable';
import Overlay from 'ol/Overlay';
import {getArea, getLength} from 'ol/sphere.js';
import {LineString, Polygon} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {defaults as defaultControls, OverviewMap, ZoomToExtent} from 'ol/control';


// // Geolocation functionality
// // Maybe print this
navigator.geolocation.getCurrentPosition(function(pos) {
  const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
  map.getView().animate({center: coords, zoom: 10});
  position.addFeature(new Feature(new Point(coords)));
  });


 // currentLocation: draw current location uses default ol.style
const position = new VectorSource();
const currentPosition = new VectorLayer({
  source: position
});

// Example GeoJSON/vector layer
const countryLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: './data/countries.json'
  }),
  // style: function(feature) {
  //   style.getText().setText(feature.get('name'));
  //   return style;
  // }, 
 // zIndex: 1
});

// Add example field polygon
const fieldLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: './data/field.json'
  }),
  style: new Style({
    fill: new Fill({
      color: 'green'
    })
  })
});



// OL5 Measure example 

const raster = new TileLayer({
  source: new OSM()
});

const source = new VectorSource();

const vector = new VectorLayer({
  source: source,
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


/**
 * Currently drawn feature.
 * @type {module:ol/Feature~Feature}
 */
let sketch;


/**
 * The help tooltip element.
 * @type {Element}
 */
let helpTooltipElement;


/**
 * Overlay to show the help messages.
 * @type {module:ol/Overlay}
 */
let helpTooltip;


/**
 * The measure tooltip element.
 * @type {Element}
 */
let measureTooltipElement;


/**
 * Overlay to show the measurement.
 * @type {module:ol/Overlay}
 */
let measureTooltip;


/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
const continuePolygonMsg = 'Click to continue drawing the polygon';


/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
const continueLineMsg = 'Click to continue drawing the line';


/**
 * Handle pointer move.
 * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
 */
const pointerMoveHandler = function(evt) {
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  let helpMsg = 'Click to start drawing';

  if (sketch) {
    const geom = (sketch.getGeometry());
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};




const map = new Map({
  layers: [raster, vector, currentPosition, countryLayer, fieldLayer],
  controls: defaultControls().extend([
    new OverviewMap(),
    new ZoomToExtent ({
      // [minx, miny, maxx, maxy]
      extent: [
        -600000, 7009900, -300000, 8000000
      ]
    })
  ]),
  target: 'map-container',
  view: new View({
    center: [-300000, 8000000],
    zoom: 6
  })
    });

map.on('pointermove', pointerMoveHandler);

map.getViewport().addEventListener('mouseout', function() {
  helpTooltipElement.classList.add('hidden');
});

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later


/**
 * Format length output.
 * @param {module:ol/geom/LineString~LineString} line The line.
 * @return {string} The formatted length.
 */
const formatLength = function(line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
        ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
        ' ' + 'm';
  }
  return output;
};


/**
 * Format area output.
 * @param {module:ol/geom/Polygon~Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
const formatArea = function(polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = (Math.round(area / 1000000 * 100) / 100) +
        ' ' + 'km<sup>2</sup>';
  } else {
    output = (Math.round(area * 100) / 100) +
        ' ' + 'm<sup>2</sup>';
  }
  return output;
};

function addInteraction() {
  const type = (typeSelect.value == 'area' ? 'Polygon' : 'LineString');
  draw = new Draw({
    source: source,
    type: type,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)'
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        })
      })
    })
  });
  map.addInteraction(draw);

  createMeasureTooltip();
  createHelpTooltip();

  let listener;
  draw.on('drawstart',
    function(evt) {
      // set sketch
      sketch = evt.feature;

      /** @type {module:ol/coordinate~Coordinate|undefined} */
      let tooltipCoord = evt.coordinate;

      listener = sketch.getGeometry().on('change', function(evt) {
        const geom = evt.target;
        let output;
        if (geom instanceof Polygon) {
          output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    }, this);

  draw.on('drawend',
    function() {
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      unByKey(listener);
    }, this);
}


/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
}


/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
}


/**
 * Let user change the geometry type.
 */
typeSelect.onchange = function() {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();


// add from workshop clear and download buttons
// clear in ws on source (here vector)
// const clearVector = document.getElementById('clear');
// clearVector.addEventListener('click', function() {
//   source.clear();
// });

// Try workshop download code 230618 not working

// const format = new GeoJSON({featureProjection: 'EPSG:3857'});
// const download = document.getElementById('download');
// source.on('change', function() {
//   const features = source.getFeatures();
//   const json = format.writeFeatures(features);
//   download.href = 'data:text/json;charset=utf-8,' + json;
// });




// Remove tooltip class 230618 not working
// const clearTooltip = document.getElementsByClassName('measureTooltip');
// clearTooltip.addEventListener('click', function() {
//   source.clear();
// });


// Older code

// // Define raster layers (210618  causing an error) 
// const raster = new TileLayer({
//   source: new OSM()
// });


// Define draw layer
// const drawSource = new VectorSource();
// const drawLayer = new VectorLayer({
//   source: drawSource,
//   zIndex: 2,
//   style: new Style({
//     fill: new Fill({
//       color: 'rgba(255, 255, 255, 0.2)'
//     }),
//     stroke: new Stroke({
//       color: '#ffcc33',
//       width: 2
//       }),
//       image: new CircleStyle({
//         radius: 7,
//         fill: new Fill({
//           color: '#ffcc33'
//         })
//       }) 
//     })
//   });
//   // add comment
//   // currentLocation: draw current location uses default ol.style
// const position = new VectorSource();
// const currentPosition = new VectorLayer({
//   source: position
// });



// // GeoJSON layer
// // I may need to set style (see example http://openlayers.org/en/beta/examples/vector-layer.html?q=geojson )


// // // Working OL code
// // new Map({
// //   target: 'map-container',
// //   layers: [
// //     new VectorLayer({
// //       source: new VectorSource({
// //         format: new GeoJSON(),
// //         url: './data/countries.json'
// //       })
// //     })
// //   ],
// //   view: new View({
// //     center: [0, 0],
// //     zoom: 2
// //   })
// // });




// //

// const countryLayer = new VectorLayer({
//   source: new VectorSource({
//     format: new GeoJSON(),
//     url: './data/countries.json'
  
//   }),
//   // style: function(feature) {
//   //   style.getText().setText(feature.get('name'));
//   //   return style;
//   // }, 
//   zIndex: 1
// });

// // small change
// // Simple map object with array of layers
// const map = new Map({
//   target: 'map-container',
//   layers: [currentPosition, drawLayer, countryLayer],
//   // layers: [countryLayer],
//   view: new View({
//     center: [0,0],
//     zoom: 2
//   })

// });

// // Synchronise the map view with the URL hash
// // This was causing a type error (stack back to ol-hashed) 
// // sync(map);

// // Draw and modify
// const modify = new Modify({source: drawSource});
// map.addInteraction(modify);

// let draw, snap;
// const typeSelect = document.getElementById('type');


// // Jontas fiddle add vars NOT WORKING
// // var vectorSource = new VectorSource();
// // var vectorLayer = new VectorLayer({
// //   source: vectorSource });
// //   map.addLayer(vectorLayer);
// // var coords_element = document.getElementById('coords');
// // var coords_length = 0;


//  function addInteractions() {
//    draw = new Draw({
//      source: drawSource,
//      type: typeSelect.value,
//      // Jontas  fiddle NOT WORKING 
// //     geometryFunction: function (coords, geom) {
// //       if (!geom) geom = new
// //       LineString(null);
// //       geom.setCoordinates(coords);
// //       //if linestring changed
// //       if(coords.length !== coords_length) {
// //         coords_length = coords.length;
// //         coords_element.innerHTML = coords.join('<br>');
// //       }
// //       return geom;

//     // }
//    });
//    map.addInteraction(draw);

// // Jonatas fiddle code for feature console NOT WORKING

// // var feature;

// // draw.on('drawend', function(evt) {
// //   console.infor('drawend');
// //   //console.info(evt);
// //   feature = evt.feature;
// // });
// // vectorSource.on('addfeature', 
// // function(evt) {
// //   console.info('addfeature');
// //   console.info(evt);
// //   console.info(evt.feature === feature);
// // });


//   snap = new Snap({source: drawSource});
//   map.addInteraction(snap);
//   }

// typeSelect.onchange = function() {
//   map.removeInteraction(draw);
//   map.removeInteraction(snap);
//   addInteractions();
// };

//  addInteractions();


// // Mouse position
// const mousePositionControl = new MousePosition({
//   coordinateFormat: createStringXY(4),
//   projection: 'EPSG:4326',
//   className: 'custom-mouse-position', //not sure needed
//   target: document.getElementById('mouse-position'),
//   undefinedHTML: '&nbsp;'
// });
// map.addControl(mousePositionControl);

// // Linking mouse position to form
// const projectionSelect = document.getElementById('projection');
// projectionSelect.addEventListener('change', function(event) {
//   mousePositionControl.setProjection(event.target.value);
// });

// const precisionInput = document.getElementById('precision');
// precisionInput.addEventListener('change', function(event) {
//   const format = createStringXY(event.target.valueAsNumber);
//   mousePositionControl.setCoordinateFormat(format);
// });

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



