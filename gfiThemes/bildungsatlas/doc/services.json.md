## gfi_theme_params ##
Hier werden die speziellen Parameter vom Bildungsatlas für die GFI-Templates definiert.

|Name|params|
|----|------|
|bildungsatlas|**[params](#markdown-header-gfi_theme_bildungsatlas_params)**|

***

## gfi_theme_bildungsatlas_params ##
Hier werden die Parameter für das GFI-Template "bildungsatlas" definiert.

|Name|Verpflichtend|Typ|default|Beschreibung|
|----|-------------|---|-------|------------|
|subTheme|nein|String|undefined|Durch Verwendung von Sub-Themes können komplexe Gfi-Themes entlang der Vererbungshierarchie in Unterbereiche aufgeteilt und besser handhabbar gemacht werden.|

**Beispiel gfiTheme für das template "Default":**

```
#!json
"gfiTheme": {
   "name": "bildungsatlas",
   "params": {
        "subTheme":  "BildungsatlasBalkendiagramm",
   }
}
```

***
