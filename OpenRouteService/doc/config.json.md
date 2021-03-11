**DistrictSelector**

Mit dem OpenRouteSerivce Addon können Anfragen an einen OpenRouteService Dienst (z.B. den BKG) gestellt und in der Karte visualisiert werden.
Die Ergebnisse werden als GeoJson im Store gespeichert und können über die StoreGetters abgerufen werden.
Die API umfasst Isochronen, Routen und Matrix-Request. Die Dokumentation findet sich unter https://openrouteservice.org/dev/#/api-docs.
Das Modul hat kein UI und wird über eine StoreAction angesprochen.

***BETA***
Gegenwärtig sind (für den Anwendungsfall CoSI) nur Isochronen für die Visualisierung implementiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerId|nein|OpenRouteService|String|ID des Layers für die Visualisierung der Ergebnisse.|
|zindex|nein|3000|Number|Z-Index des Layers für die Visualisierungen.|
|requestUrl|nein|String|https://api.openrouteservice.org/v2|URL der API.|
|apiKey|ja|String|Authentifikation für die API, muss gesetzt werden wenn die offene OpenRouteService API verwendet wird.|
|requestServices|no|String[]|["isochrones", "matrix", "directions"]|Die verfügbaren Dienste im definierten OpenRouteService.|
|requestProfiles|no|String[]|["foot-walking", "driving-car", "driving-lgv", "cycling-regular", "cycling-electric", "wheelchair"]|Die verfügbaren Profile im definierten OpenRouteService.|
|defaultJoinIsochrones|no|Boolean|true|Definiert ob die Isochronen derselben Ebene verbunden werden sollen, wenn sie sich überlappen|
|colorspace|nein|String|interpolateRdYlGn|Farb-Skala der Visualisierungen, vgl. https://github.com/d3/d3-scale-chromatic|
|coloralpha|nein|Number|0.1|Transparenz der Visualisierungen.|
|innerLineWidth|nein|Number|1.5|Innere Linienstärke der Polygone.|
|outerLineWidth|nein|Number|4.5|Äußere Linienstärken der Polygone und Linien.|
|crs|nein|Object|Beinhaltet die Projektionsnamen vom Portal und vom Dienst.|
|crs.portal|nein|String|EPSG:25832|Projektion des Portals, UTM32 für die UDP.|
|crs.service|nein|String|EPSG:4326|Projektion des Dienstes, WGS84 für den ORS.|


**Beispiel**
```
"OpenRouteService": {
  "name": "OpenRouteService",
  "isVisibleInMenu": false,
  "requestUrl": "https://api.openrouteservice.org/v2",
  "apiKey": "aBcD1XyZ2345",
  "colorspace": "interpolateRdYlGn",
  "coloralpha": 0.1,
  "innerLineWidth": 1.5,
  "outerLineWidth": 4.5,
}
```

***
