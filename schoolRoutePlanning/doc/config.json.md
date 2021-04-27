#### Portalconfig.menu.tools.children

List of all configurable tools. Each tool inherits from **[tool](#markdown-header-portalconfigmenutool)** and thus can/must also have the attributes specified there configured.

|Name|Required|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|schulwegrouting|nein|**[schulwegrouting](#markdown-header-portalconfigmenutoolschulwegrouting)**||Schulwegrouting.|true|

***

#### Portalconfig.menu.tool.schulwegrouting

With this Hamburg-specific tool, the route can be calculated from any Hamburg address to any Hamburg school. The official school entrances are also considered.

**ATTENTION: Backend necessary!**

**An FME workbench is addressed via a WPS, which calculates the routing.**

|Name|Required|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|layerId|nein|String|"8712"|Id of the layer that contains the schools. This layer must also be configured in the **[themeconfig](#markdown-header-themeconfig)**.|true|
|wpsId|nein|String|"1001"|Id of the WPS from the rest-services.json that triggers the configured FME process.|true|
|fmwProcess|nein|String|"schulwegrouting_wps.fmw"|FME process that calculates a school route.|true|

**Beispiel**
```
#!json
"schulwegrouting": {
    "name": "Schulweg-Routing",
    "glyphicon": "glyphicon-filter",
    "layerId": "8712",
    "wpsId: "1001",
    "fmwProcess": "schulwegrouting_wps.fmw"
}
```

***
