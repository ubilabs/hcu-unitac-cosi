#### Portalconfig.menu.tools.qr

Für urlSchema gibt es 2 Platzhalter:
- `{{LAT}}`
- `{{LANG}}`
die mit den Koordinaten des Klickevent beim Platzieren ersetzt werden.

`text` gibt den Text an der im Toolwindow angezeigt wird.
```
#!json
"qr": {
    "name": "QR-Code",
    "glyphicon": "glyphicon-qrcode",
    "urlSchema": "https://www.google.de/maps/@{{LAT}},{{LANG}}",
    "text": "Lorem ipsum"
}
```
