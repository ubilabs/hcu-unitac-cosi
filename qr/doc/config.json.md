#### Portalconfig.menu.tools.qr

Für urlSchema gibt es 2 Platzhalter:
- `{{LAT}}`
- `{{LON}}`
die mit den Koordinaten des Klickevent beim Platzieren ersetzt werden.

```
#!json
"qr": {
    "name": "QR-Code",
    "glyphicon": "glyphicon-qrcode",
    "urlSchema": "https://www.google.de/maps/@{{LAT}},{{LON}}",
    "text": "Lorem ipsum",
    "projection": "EPSG:25832"
}
```

- `text`: Gibt den Text an der im Toolwindow angezeigt wird.
- `projection`: Gibt die Projektion an, in der die Koordinaten in die URL eingesetzt werden. (*EPSG:25832* ist der Standard des Masterportal)
