### Erreichbarkeitsanalyse
Eine Erreichbarkeitsanalyse kann auf zwei Arten durchgeführt werden:  
1. [Ab einem Referenzpunkt](#markdown-header-erreichbarkeit-ab-einem-Referenzpunkt)  
2. [Im Planungsgebiet](#markdown-header-erreichbarkeit-im-gebiet)  

Der Modus der Analyse kann im Dropdown Menü ausgewählt werden.

**Wichtige Informationen:**
Dieses Werkzeug wurde realisiert unter Verwendung von OpenRouteService, einem Dienst, der von der Heidelberg Institute for Geoinformation Technology entwickelt und bereitgestellt wird.
Die Verwendung ist gedeckt durch die Creative Commons Lizenz CC BY 4.0.
Weitere Informationen finden Sie unter:  
https://heigit.org/de/ortsbasierte-dienste-und-navigation/  
https://openrouteservice.org/services/

#### Erreichbarkeit ab einem Referenzpunkt
Zeigt ein Gebiet an, welches von einem ausgewählten Punkt auf der Karte innerhalb einer festgelegten Entfernung erreichbar ist. Die Entfernung kann in Zeit oder in Metern angegeben werden. Die Erreichbarkeit wird abhängig vom Verkehrsmittel berechnet. Die Polygone werden automatisch angepasst, wenn das Verkehrsmittel oder andere Parameter geändert werden.  
  
Das Modul kann verwendet werden, ohne vorherige Gebietsauswahl.
  


![Abbildung 1: Erreichbarkeit ab einem Referenzpunkt](https://user-images.githubusercontent.com/43250699/142921422-5f9a0e75-5867-4fa9-bf63-fff42c02cb0d.jpg)

*Abbildung 1: Erreichbarkeit ab einem Referenzpunkt*
  
1. **Auswahl des Modus**
   > Art der Einrichtungsanalyse. Ab einem Referenzpunkt oder Erreichbarkeit der gewählten Einrichtungen.
2. **Referenzpunkt setzen**
   > Durch Klicken auf der Karte wird der Punkt gesetzt, von dem aus berechnet wird.
3. **Verkehrsmittel festlegen** 
   > Das Verkehrsmittel wird ausgewählt aus einer Liste. Folgende Verkehrsmittel stehen aktuell zur Verfügung: Auto, Rad, Rad (elektrisch), Gehen, Rollstuhl.
4. **Maßeinheit der Entfernung festlegen**
   > Festlegen, ob die Entfernung in Minuten oder in Metern angegeben wird
5. **Entfernung**
   > Entfernung in zuvor festgelegter Maßeinheit (Minuten oder Metern) angeben
6. **Berechnen**
7. **Info** 
   > Der Info Button enthält weitere Informationen über das Modul. 
8. **Ergebnis Löschen**
   > Durch Klick auf diesen Button wird die Berechnung gelöscht und die Polygone aus der Karte entfernt.
9. **Einwohnerabfrage**
   > (s. Einwohnerabfrage)
10. **Legende & Polygone**
   > Eine Legende wird eingeblendet. Sie wird dynamisch für die Heatmap generiert und zeigt drei gleichmäßig verteilte Entfernungswerte. Höchstwert ist der zuvor eingegebene Wert für die Entfernung. Die Polygone in der Karte sind entsprechend der Legende eingefärbt.
   Sie zeigen das, vom Referenzpunkt aus, erreichbare Gebiet abhängig von den zuvor eingegebenen Parametern als Heatmap.
11. **Download als GeoJSON**


#### Erreichbarkeit im Gebiet
Zeigt die Abdeckung und Erreichbarkeit von einer zuvor festgelegten Einrichtungsart (z.B. Kindergärten) in dem festgelegten Einzugsbereich (Planungsgebiet). Der Einzugsbereich ist die Entfernung von der jeweiligen Einrichtung und kann angegeben werden in Zeit oder in Metern. Die Erreichbarkeit ist abhängig von dem festgelegten Verkehrsmittel.

![Abbildung 2: Erreichbarkeit ausgewählter Einrichtungen im Gebiet](https://user-images.githubusercontent.com/43250699/142923253-c745b0d3-f698-4f6e-b744-cecf30981ff8.jpg)

*Abbildung 2: Erreichbarkeit ausgewählter Einrichtungen im Gebiet*

1. **Auswahl des Modus**
   > Art der Einrichtungsanalyse. Ab einem Referenzpunkt oder Erreichbarkeit der gewählten Einrichtungen.
2. **Thema auswählen**
   > Damit dieses Modul verwendet werden kann muss mindestens ein Thema aktiv sein.
3. **Verkehrsmittel festlegen**
   > Das Verkehrsmittel wird ausgewählt aus einer Liste. Folgende Verkehrsmittel stehen aktuell zur Verfügung: Auto, Rad, Rad (elektrisch), Gehen, Rollstuhl.
4. **Maßeinheit der Entfernung festlegen**
   > Festlegen, ob die Entfernung in Minuten oder in Metern angegeben wird.
5. **Entfernung**
   > Entfernung in zuvor festgelegter Maßeinheit (Minuten oder Metern) angeben.
6. **Berechnen**
7. **Info**
   > Der Info Button enthält weitere Informationen über das Modul. 
8. **Ergebnis Löschen**
   > Durch Klick auf diesen Button wird die Berechnung gelöscht und die Polygone aus der Karte entfernt.
9. **Legende und Probleme**
   > Eine Legende wird eingeblendet. Sie wird dynamisch für die Heatmap generiert und zeigt drei gleichmäßig verteilte Entfernungswerte. Höchstwert ist der zuvor eingegebene Wert für die Entfernung. Die Polygone in der Karte sind entsprechend der Legende eingefärbt. Sie zeigen das, vom Referenzpunkt aus, erreichbare Gebiet abhängig von den zuvor eingegebenen Parametern als Heatmap.
10. **Download als GeoJSON**  