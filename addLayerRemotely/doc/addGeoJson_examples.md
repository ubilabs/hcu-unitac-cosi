Following are examples of howthe addLayerRemotely Addon can be used from the browser console:

addGeoJsonRemotely:
The geojson must be constructed according to the geojson standard.
If a style needs to be added a styles parameter containing an array of styles can be added.
The id inside the styleId needs to be the same as the one used in the trigger function.

var geojson = {
  "type":"FeatureCollection",
  "features":[
    {
      "type":"Feature",
      "geometry":{
        "type":"MultiPolygon",
        "coordinates":[
          [
            [
              [
                9.782150902821929,
                53.561242336815674
              ],
              [
                9.80788047980621,
                53.553080243468536
              ],
              [
                9.790722523756013,
                53.54534652511445
              ],
              [
                9.782150902821929,
                53.561242336815674
              ]
            ]
          ],
          [
            [
              [
                9.80239064469148,
                53.541558657277925
              ],
              [
                9.825538611089947,
                53.549249511417685
              ],
              [
                9.826720264650026,
                53.53611309493565
              ],
              [
                9.80239064469148,
                53.541558657277925
              ]
            ]
          ]
        ]
      },
      "properties":{
        "test1":"WGS84",
        "test":"abc"
      }
    },
    {
      "type":"Feature",
      "geometry":{
        "type":"Point",
        "coordinates":[
          10.023374939929553,
          53.5356067536243
        ]
      }
    }
  ],
  "styles":[
    {
      "styleId":"customLayer",
      "rules":[
        {
          "style":{
            "polygonStrokeColor":[
              255,
              0,
              0,
              0.8
            ],
            "polygonStrokeWidth":3,
            "polygonStrokeDash":[
              5,
              5
            ],
            "polygonFillColor":[
              255,
              255,
              255,
              0
            ],
            "lineStrokeColor":[
              255,
              0,
              0,
              0.8
            ],
            "lineStrokeWidth":3,
            "lineStrokeDash":[
              5,
              5
            ],
            "circleStrokeColor":[
              255,
              0,
              0,
              1
            ],
            "circleFillColor":[
              255,
              0,
              0,
              0.5
            ]
          }
        }
      ]
    }
  ]
}

If treeType = light:
Backbone.Radio.trigger("addLayerRemotely", "addGeoJson", "Test2", "xyx", geojson,"customLayer", "tree",{"test1":"WGS84","test":"abc"})

If treeType = custom:
Backbone.Radio.trigger("addLayerRemotely", "addGeoJson", "Test2", "xyx", geojson,"customLayer", "External Layer",{"test1":"WGS84","test":"abc"})
