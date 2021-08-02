**DistrictSelector**

Mit dem DistrictSelector kann ein Gebiet auf Basis einer Verwaltungsebene (z.B.: Statistisches Gebiet) ausgewählt werden. Für das gewählte Gebiet werden die entsprechenden regionalstatistischen Daten geladen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|nein|String|Gebiet auswählen|Name des Werkzeuges im Menu.|
|glyphicon|nein|String|glyphicon-screenshot|CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|
|districtLevels|ja|Object[]||Beinhaltet die nötigen Informationen der einzelnen Verwaltungsebenen (siehe Beispiel).|
|districtLevels[i].layerId|ja|String||Die Layer id zum jeweiligen Verwaltungslayer.|
|districtLevels[i].label|ja|String||Die/der Bezeichnung/ Name für die Verwaltungsebene.|
|districtLevels[i].keyOfAttrName|ja|String||Der Key für das Attribut in dem der Name der Verwaltungeinheit steht.|
|districtLevels[i].duplicateDistrictNames|nein|String[]||Namen von Gebieten, die Konflikte auslösen. Eimsbüttel zum Beispiel gibt es als Stadtteil und als Bezirk. Die Namen sind bei der höheren Verwaltungsebene anzugeben.|
|districtLevels[i].stats|ja|Object||Definiert URL und den Key des Attributes "Name" für die statistischen Daten.|
|districtLevels[i].stats.keyOfAttrName|ja|String||Key des Attributes "Name" für die statistischen Daten.|
|districtLevels[i].stats.baseUrl|ja|String[]||Die URLs der WFS Dienste für die statistischen Daten.|
|districtLevels[i].activeStyle|nein|Object||Benutzerdefinierte Styles für die jeweils ausgewählte Verwaltungsebene. Entspricht der Hierarchie des OpenLayers Style Definition|
|additionalInfoLayers|nein|{[key: String]: String[]}|Zusätzliche Info Layer die beim Nutzen des Tools angezeigt werden können. Der Key ist der angezeigte Bezeichner, der Value die Liste an Layer IDs|

**Beispiel**
```
"districtSelector": {
  "glyphicon": "glyphicon-picture",
  "districtLevels": [
    {
      "layerId": "6071",
      "label": "Statistische Gebiete",
      "keyOfAttrName": "statgebiet",
      "stats": {
        "keyOfAttrName": "statgebiet",
        "baseUrl": ["https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Statistische_Gebiete"]
      },
      "activeStyle": {
        "fill": {"color": [255, 255, 255, 0]},
        "stroke": {"color": "#3399CC", "width": 2}
      }
    },
    {
      "layerId": "1694",
      "label": "Stadtteile",
      "keyOfAttrName": "stadtteil_name",
      "stats": {
        "keyOfAttrName": "stadtteil",
        "baseUrl": ["https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Stadtteile"]
      }
    },
    {
      "layerId": "1692",
      "label":"Bezirke",
      "keyOfAttrName": "bezirk_name",
      "duplicateDistrictNames": ["Eimsbüttel", "Wandsbek", "Bergedorf"],
      "stats": {
        "keyOfAttrName": "bezirk",
        "baseUrl": ["https://geodienste.hamburg.de/HH_WFS_Regionalstatistische_Daten_Bezirke"]
      }
    }
  ],
  "active": true,
  "additionalInfoLayers": {
    "Sozialräume": ["20179"],
    "RISE": ["4411", "13895", "17040", "18712", "4413", "4409", "18713", "4412", "4410", "18714", "10767"]
}
```

***
