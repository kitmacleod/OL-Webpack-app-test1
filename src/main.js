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

// need to refactor to @turf/intersection
import * as turf from '@turf/turf';


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

// Add simple GeoJSON of Scotland (ideally not here)

var squareScotland =
{
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [
          -7.4267578125,
          55.00282580979323
        ],
        [
          -1.494140625,
          55.00282580979323
        ],
        [
          -1.494140625,
          58.56252272853734
        ],
        [
          -7.4267578125,
          58.56252272853734
        ],
        [
          -7.4267578125,
          55.00282580979323
        ]
      ]
    ]
  }
}






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
        // Delete
        // var format = new GeoJSON();
        // var geomFeatures = format.writeFeatures(vector);
        // console.log(geomFeatures);
   
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    }, this);
  
  draw.on('drawend',
    function(evt) {
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch 
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      unByKey(listener);
      // I think this is where to write feature, comment out whilst inspecting objects 
      let parser = new GeoJSON();
      // Creates string of polygon and then parse it
      let userFeature = parser.writeFeature(evt.feature, {featureProjection: 'EPSG:3857'});
      var userFeatureObj = JSON.parse(userFeature);
      //  console.log(typeof userFeature);
      //  console.log(userFeature);
       console.log('Type: ',typeof userFeatureObj);
       console.log('userFeatureObj',userFeatureObj);
      
    //   // Save string locally and test it exists (gets overwritten with each feature)
    //  localStorage.setItem('drawnFeature', userFeature);
    //  if(userFeature) {
    //    console.log("userFeature Exists");
    //  } else {
    //    console.log("userFeature not exist");
    //  }

    // Try intersect with Scotland geojson feature
    console.log('Type: ',typeof squareScotland);
    console.log('countryLayer',squareScotland);

    var intersectionScot = turf.intersect(squareScotland, userFeatureObj);
    console.log('Type: ',typeof intersectionScot);
    console.log('intersectionScot', intersectionScot);

// Try intersect with culterPoly geojson featureCollection 
    console.log('Type: ',typeof culterPoly);
    console.log('culterPoly',culterPoly);


    // var intersectionCulter = turf.intersect(culterPoly, userFeatureObj);
    // console.log('Type: ',typeof intersectionCulter);
    // console.log('intersection', intersectionCulter);




    // Looking to add intersection to vector layer, but not needed
    // var format = new GeoJSON();
    // var vectorSource = new VectorSource();
    // var feature = format.readFeature(intersection, {
    //   featureProjection: 'EPSG:3857'
    // });
    // vectorSource.addFeature(feature);
    // var vectorLayer = new VectorLayer({
    //   source: vectorSource,
    //   style: [
    //     new Style({
    //       stroke: new Stroke({
    //         color: [0, 121, 88, 1],
    //         width: 2
    //       }),
    //       fill: new Fill({
    //         color: [0, 0, 88, 0.6]
    //       })
    //     })
    //   ]
    // });











      // Try to strinify the json
      // const userFeatureObjStr = JSON.stringify(userFeatureObj);
      // console.log(userFeatureObjStr);
      // localStorage.setItem('drawnFeature1', userFeatureObjStr);

    }, this);
}

// I cannot feature is available outside of function
// console.log('Type: ',typeof userFeatureObj);
// console.log('userFeatureObj',userFeatureObj);

// // Try intersection outside the draw.on 'end'
// // Try @Turf/intersect 

// // Try add featureLayer, errors

// var poly1 =
// {
//   "type": "Feature",
//   "properties": {},
//   "geometry": {
//     "type": "Polygon",
//     "coordinates": [
//       [
//         [
//           -5.2734375,
//           51.6180165487737
//         ],
//         [
//           -50.2734375,
//           44.84029065139799
//         ],
//         [
//           -40.78125,
//           23.563987128451217
//         ],
//         [
//           7.03125,
//           49.15296965617042
//         ],
//         [
//           -5.2734375,
//           51.6180165487737
//         ]
//       ]
//     ]
//   }
// }
//   // Declare a source
//   var featureSource = new VectorSource();

// // Add my geojson feature 
// var poly1Feature = format.readFeature(poly1, {
//   featureProjection: 'EPSG:3857'
// });
// featureSource.addFeature(poly1Feature);



// var featureLayer = new VectorLayer({
//   source: featureSource,
//   style: [
//     new Style({
//       stroke: new Stroke({
//         color: [0, 121, 88, 1],
//         width: 2
//       }),
//       fill: new Fill({
//         color: [0, 0, 88, 0.6]
//       })
//     })
//   ]
// });



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



//-- Adding test data

var culterPoly = 

{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "landcover": "woodland",
        "PhosphorusExport": 1,
        "NitrogenExport": 10
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -2.2614669799804688,
              57.09299206383102
            ],
            [
              -2.2638702392578125,
              57.09317858276609
            ],
            [
              -2.2638702392578125,
              57.092245978707545
            ],
            [
              -2.265758514404297,
              57.09047396636831
            ],
            [
              -2.2678184509277344,
              57.088515327886505
            ],
            [
              -2.265758514404297,
              57.08776915268033
            ],
            [
              -2.2679901123046875,
              57.084224615407685
            ],
            [
              -2.2733116149902344,
              57.08123947914921
            ],
            [
              -2.279491424560547,
              57.08030657479793
            ],
            [
              -2.2801780700683594,
              57.07918705860559
            ],
            [
              -2.2733116149902344,
              57.07956023442378
            ],
            [
              -2.264556884765625,
              57.08347835386635
            ],
            [
              -2.26043701171875,
              57.08692968762649
            ],
            [
              -2.2614669799804688,
              57.09299206383102
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "landcover": "grass",
        "PhosphorusExport": 5,
        "NitrogenExport": 30
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -2.2793197631835933,
              57.080679739353954
            ],
            [
              -2.2733116149902344,
              57.08151934587941
            ],
            [
              -2.2683334350585938,
              57.084504459614585
            ],
            [
              -2.2662734985351562,
              57.08758260653281
            ],
            [
              -2.2678184509277344,
              57.08832878549255
            ],
            [
              -2.275543212890625,
              57.087675879723875
            ],
            [
              -2.2765731811523438,
              57.085250700510024
            ],
            [
              -2.280864715576172,
              57.08357163738019
            ],
            [
              -2.2793197631835933,
              57.080679739353954
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "landcover": "arable",
        "PhosphorusExport": 10,
        "NitrogenExport": 200
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -2.2760581970214844,
              57.08776915268033
            ],
            [
              -2.2683334350585938,
              57.08823551394367
            ],
            [
              -2.2649002075195312,
              57.09140661499798
            ],
            [
              -2.2681617736816406,
              57.09299206383102
            ],
            [
              -2.272624969482422,
              57.092152717011494
            ],
            [
              -2.2765731811523438,
              57.09168640501245
            ],
            [
              -2.2800064086914062,
              57.090100900347906
            ],
            [
              -2.2760581970214844,
              57.08776915268033
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "landcover": "urban",
        "PhosphorusExport": 3,
        "NitrogenExport": 50
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -2.272796630859375,
              57.09243250139593
            ],
            [
              -2.268505096435547,
              57.092898804011625
            ],
            [
              -2.2621536254882812,
              57.09336510076283
            ],
            [
              -2.2607803344726562,
              57.097095263654545
            ],
            [
              -2.272968292236328,
              57.09802774573524
            ],
            [
              -2.2762298583984375,
              57.098214239336606
            ],
            [
              -2.2774314880371094,
              57.09625600972661
            ],
            [
              -2.272796630859375,
              57.09243250139593
            ]
          ]
        ]
      }
    }
  ]
}