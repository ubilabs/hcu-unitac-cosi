# Portalconfig.menu.tools.children

List of all configurable tools. Each tool inherits from **[tool](#markdown-header-portalconfigmenutool)** and thus can/must also have the attributes specified there configured.

|Name|Mandatory|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|obliqueViewer|no|**[obliqueViewer](#markdown-header-portalconfigmenutoolschildrenobliqueViewer)**||Tool to include oblique aerial view application from vcs.|false|



## Portalconfig.menu.tools.children.obliqueViewer

Tool to include the oblique aerial viewer application from vcs in the sidebar.
Mobile it will be displayed in the window.

***


### ObliqueViewer - Configuration

|Name|Mandatory|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|name|yes|String|Elevation|The title of the tool or the entry in the tool list|false|
|icon|yes|string|bi-camera-fill|The icon to use.|false|
|styleId|no|String|"obliqueViewer"|StyleId to style the mapmarker in the map when obliqueviewer is open.|true|

**Example**
```
#!json
    "obliqueViewer": {
    "name": "translate#additional:modules.tools.obliqueViewer.title",
    "icon": "bi-image"
    }
```

***

