# Portalconfig.menu.tools.children

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von **[tool](#markdown-header-portalconfigmenutool)** und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|obliqueViewer|nein|**[obliqueViewer](#markdown-header-portalconfigmenutoolschildrenobliqueViewer)**||Werkzeug zum einbinden der Schrägluftbildanwendung von vcs.|false|



## Portalconfig.menu.tools.children.obliqueViewer

Werkzeug zum einbinden der Schrägluftbildanwendung von vcs in der Sidebar.
Mobil wird sie im window angezeigt.

***


### ObliqueViewer - Konfiguration

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String|Schrägluftbilder|Der Titel des Werkzeuges bzw. der Eintrag in der Werkzeugliste|false|
|icon|ja|String|bi-camera-fill|Das zu verwendende Icon.|false|
|styleId|nein|String|"obliqueViewer"|StyleId, um den Mapmarker in der Karte zu stylen, wenn Schrägluftbilder geöffnet ist.|true|





**Beispiel**
```
#!json
    "obliqueViewer": {
    "name": "translate#additional:modules.tools.obliqueViewer.title",
    "icon": "bi-image"
    }
```

***




