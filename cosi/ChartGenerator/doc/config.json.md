**ChartGenerator**

Der ChartGenerator erstellt aus entsprechend formatierten Daten Visualisierungen mit Hilfe von vue-chart.js und verwalted alle in der Session erstellen Graphen in einem Toolfenster.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|nein|String|Gebiet auswählen|Name des Werkzeuges im Menu.|
|glyphicon|nein|String|glyphicon-map|CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|
|isVisibleInMenu|nein|Boolean|false|Das Tool wird nicht im Menü geladen.|

**Beispiel**
```
"chartGenerator": {
  "name": "Graphenvisualisierung",
  "glyphicon": "glyphicon-stats,
  "isVisibleInMenu", false
}
```

***
