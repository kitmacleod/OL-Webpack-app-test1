import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/geojson';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';

import * as turf from '@turf/turf';

// The purpose of this was to add geojson feature and carry out Turf intersection


// var coordinates1 = [[[-3.6474609374999996,48.1367666796927],[1.9335937499999998,50.51342652633956],[7.4267578125,48.777912755501845],[6.1962890625,46.437856895024204],[7.250976562499999,43.644025847699496],[5.9326171875,43.16512263158296],[3.955078125,43.48481212891603],[2.8125,42.74701217318067],[0.5712890625,42.779275360241904],[-1.6259765625,43.389081939117496],[-1.0986328125,45.55252525134013],[-2.1533203125,47.100044694025215],[-3.515625,47.78363463526376],[-3.6474609374999996,48.1367666796927]]];
//       var polygon1 = turf.polygon(coordinates1);

//       var coordinates2 = [[[-0.52734375,47.040182144806664],[2.28515625,48.28319289548349],[3.1640625,46.830133640447386],[1.845703125,45.706179285330855],[-0.52734375,47.040182144806664]]];
//       var polygon2 = turf.polygon(coordinates2);

//       var intersect1 = turf.intersect(polygon1, polygon2);

//       var coordinates3 = [[[-2.021484375,34.66935854524543],[-1.142578125,32.175612478499325],[-8.876953125,27.761329874505233],[-8.96484375,26.27371402440643],[-11.865234375,25.48295117535531],[-13.0078125,21.69826549685252],[-17.314453125,21.12549763660628],[-13.623046875,27.449790329784214],[-10.1953125,29.305561325527698],[-9.4921875,31.728167146023935],[-8.349609375,33.358061612778876],[-5.80078125,35.67514743608467],[-2.021484375,34.66935854524543]]];
//       var polygon3 = turf.polygon(coordinates3);

//       var coordinates4 = [[[-7.998046875,27.137368359795584],[-11.77734375,27.449790329784214],[-15.380859374999998,22.43134015636061],[-15.380859374999998,19.31114335506464],[-11.953125,18.646245142670608],[-8.26171875,22.836945920943855],[-7.998046875,27.137368359795584]]];
//       var polygon4 = turf.polygon(coordinates4);

//       var intersect2 = turf.intersect(polygon3, polygon4);

//       // Declare a formatter to read GeoJSON
//       var format = new GeoJSON();

//       // Declare a source
//       var vectorSource = new VectorSource();

//       // When reading feature, reproject to EPSG 3857
//       var feature1 = format.readFeature(intersect1, {
//         featureProjection: 'EPSG:3857'
//       });
//       // Add a feature
//       vectorSource.addFeature(feature1);

//       // When reading feature, reproject to EPSG 3857
//       var feature2 = format.readFeature(intersect2, {
//         featureProjection: 'EPSG:3857'
//       });

//       // Add a feature
//       vectorSource.addFeature(feature2);

//       // Declare a vector layer with the already
//       // created source containing added feature
//       var vectorLayer = new VectorLayer({
//         source: vectorSource,
//         style: [
//           new Style({
//             stroke: new Stroke({
//               color: [0, 121, 88, 1],
//               width: 2
//             }),
//             fill: new Fill({
//               color: [0, 0, 88, 0.6]
//             })
//           })
//         ]
//       });

//       // Instanciate a map and add layers
//       var map = new Map({
//         target: 'map',
//         layers: [
//           new TileLayer({
//             source: new OSM()
//           }),
//           vectorLayer
//         ],
//         view: new View({
//           center: [-3, 35],
//           zoom: 3
//         })
//       });

      // Modify the above working code OL Turf examples with simple Turf example

    
        // Add my own feature/collection

      var poly1 =
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    -12.3046875,
                    58.07787626787517
                  ],
                  [
                    -23.90625,
                    49.61070993807422
                  ],
                  [
                    -13.0078125,
                    45.089035564831036
                  ],
                  [
                    -7.03125,
                    24.5271348225978
                  ],
                  [
                    21.4453125,
                    39.639537564366684
                  ],
                  [
                    18.6328125,
                    58.26328705248601
                  ],
                  [
                    -12.3046875,
                    58.07787626787517
                  ]
                ]
              ]
            }
          }

          var poly2 =
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    -5.2734375,
                    51.6180165487737
                  ],
                  [
                    -50.2734375,
                    44.84029065139799
                  ],
                  [
                    -40.78125,
                    23.563987128451217
                  ],
                  [
                    7.03125,
                    49.15296965617042
                  ],
                  [
                    -5.2734375,
                    51.6180165487737
                  ]
                ]
              ]
            }
          }
     
      

       var intersection = turf.intersect(poly1, poly2);
       
       // Code

       // Declare a formatter to read GeoJSON
      var format = new GeoJSON();

      // Declare a source
      var vectorSource = new VectorSource();

      // When reading feature, reproject to EPSG 3857
      var feature = format.readFeature(intersection, {
        featureProjection: 'EPSG:3857'
      });
      // Add a feature
      vectorSource.addFeature(feature);

      // Add my geojson feature 
      var poly1Feature = format.readFeature(poly1, {
        featureProjection: 'EPSG:3857'
      });
      vectorSource.addFeature(poly1Feature);


      // Declare a vector layer with the already
      // created source containing added feature
      var vectorLayer = new VectorLayer({
        source: vectorSource,
        style: [
          new Style({
            stroke: new Stroke({
              color: [0, 121, 88, 1],
              width: 2
            }),
            fill: new Fill({
              color: [0, 0, 88, 0.6]
            })
          })
        ]
      });

      // Instanciate a map and add layers
      var map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        view: new View({
          center: fromLonLat([-3, 55]),
          zoom: 3
        })
      });
       
