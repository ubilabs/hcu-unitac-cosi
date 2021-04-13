**ColorCodeMap**

Die ColorCodeMap Component färbt die Karte basierend auf ausgewählten Gebieten und deren verfügbaren regionalstatistischen Datensätzen ein. Des Weiteren kann die Einfärbung der Karte über alle verfügbaren Jahre dynamisch animiniert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|nein|String|Gebiet auswählen|Name des Werkzeuges im Menu.|
|glyphicon|nein|String|glyphicon-screenshot|CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|
|districtLevels|ja|Object[]||Beinhaltet die nötigen Informationen der einzelnen Verwaltungsebenen (siehe Beispiel).|
|districtLevels[i].layerId|ja|String||Die Layer id zum jeweiligen Verwaltungslayer.|
|districtLevels[i].label|ja|String||Die/der Bezeichnung/ Name für die Verwaltungsebene.|
|districtLevels[i].keyOfAttrName|ja|String||Der Key für das Attribut in dem der Name der Verwaltungeinheit steht.|
|districtLevels[i].keyOfAttrNameStats|ja|String||Der Key für das Attribut in dem der Name steht, für die statistischen Daten.|
|additionalInfoLayerIds|nein|String[]|[]|Zusätzliche Info Layer die beim Nutzen des Tools angezeigt werden können.|

**Beispiel**
```
"DistrictSelector": {
  "name": "Gebiet auswählen",
  "glyphicon": "glyphicon-picture",
  "districtLevels": [
    {
      "layerId": "6071",
      "label": "Statistische Gebiete",
      "keyOfAttrName": "statgebiet",
      "keyOfAttrNameStats": "statgebiet"
    },
    {
      "layerId": "1694",
      "label": "Stadtteile",
      "keyOfAttrName": "stadtteil_name",
      "keyOfAttrNameStats": "stadtteil"
    },
    {
      "layerId": "1692",
      "label":"Bezirke",
      "keyOfAttrName": "bezirk_name",
      "keyOfAttrNameStats": "bezirk"
    }
  ],
  "additionalInfoLayerIds": ["20179"]
}
```

***
