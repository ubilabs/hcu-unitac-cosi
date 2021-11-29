**ChartGenerator**

Der ChartGenerator erstellt aus entsprechend formatierten Daten Visualisierungen mit Hilfe von vue-chart.js und verwalted alle in der Session erstellten Graphen in einem Toolfenster.
Das Tool kann angesprochen werden, indem der State newDataSet im Store (stateChartGenerator.js) mit setNewDataSet überschrieben wird. Dazu beispielsweise wie folgt in die eigene Component mit einbinden:

...mapMutations("Tools/ChartGenerator", {setNewChartDataSet: "setNewDataSet"});

Übergeben werden muss eine Instanz der Klasse ChartDataSet (ChartGenerator/classes/ChartDataSet.js).

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
