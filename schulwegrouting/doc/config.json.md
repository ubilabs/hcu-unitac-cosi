#### Portalconfig.menu.tools.children

Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von **[tool](#markdown-header-portalconfigmenutool)** und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|schulwegrouting|nein|**[schulwegrouting](#markdown-header-portalconfigmenutoolschulwegrouting)**||Schulwegrouting.|true|

***

#### Portalconfig.menu.tool.schulwegrouting

Mit diesem hamburgspezifischen Tool kann von jeder hamburgischen Addresse zu jeder hamburgischen Schule die Route berechnet werden. Dabei werden auch die offiziellen Schuleingänge betrachtet.

**ACHTUNG: Backend notwendig!**

**Es wird über einen WPS eine FME-Workbench angesprochen, welche das Routing berechnet.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Id des Layers der de Schulen enthält. Dieser Layer muss auch in den **[Themenconfig](#markdown-header-themenconfig)** konfiguriert sein.|false|
|wpsId|nein|String|"1001"|Id des WPS aus der rest-services.json, der den FME-Prozess "schulwegrouting_wps.fmw" triggert.|true|

**Beispiel**
```
#!json
"schulwegrouting": {
    "name": "Schulweg-Routing",
    "glyphicon": "glyphicon-filter",
    "layerId": "8712",
    "wpsId: "1001"
}
```

***
