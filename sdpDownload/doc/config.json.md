#### Portalconfig.menu.tools.children

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von **[tool](#markdown-header-portalconfigmenutool)** und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|SdpDownload|nein|**[sdpDownload](#markdown-header-portalconfigmenutoolsdpdownload)**||Intern in Hamburg genutztes Werkzeug um Standard-Datenpakete herunterzuladen. Die Fläche wird bestimmt durch eine geometrische Auswahl auf der Karte.|true|

***

#### Portalconfig.menu.tool.sdpDownload

[inherits]: # (Portalconfig.menu.tool)

Download von Standard-Datenpaketen für Hamburg. Dieses Werkzeug öffnet sich in der Sidebar, rechts von der Karte.

**ACHTUNG: Es ist ein Backend notwendig, das die Datenpakete liefert!**



|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeuges im Menu.|false|
|glyphicon|nein|String||CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|false|


**Beispiel SDP Download**
```
#!json
"sdpDownload": {
                        "name": "SDP Download",
                        "glyphicon": "glyphicon-download"
                },
```

***
