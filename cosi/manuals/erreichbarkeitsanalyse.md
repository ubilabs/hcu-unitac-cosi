### Erreichbarkeitsanalyse
Eine Erreichbarkeitsanalyse kann auf zwei Arten durchgeführt werden:  
1. [Ab einem Referenzpunkt](#markdown-header-erreichbarkeit-ab-einem-Referenzpunkt)  
2. [Im Planungsgebiet](#markdown-header-erreichbarkeit-im-gebiet)  

Der Modus der Analyse kann im Dropdown Menü ausgewÃ¤hlt werden.

**Wichtige Informationen:**
Dieses Werkzeug wurde realisiert unter Verwendung von OpenRouteService, einem Dienst, der von der Heidelberg Institute for Geoinformation Technology entwickelt und bereitgestellt wird.
Die Verwendung ist gedeckt durch die Creative Commons Lizenz CC BY 4.0.
Weitere Informationen finden Sie unter:  
https://heigit.org/de/ortsbasierte-dienste-und-navigation/  
https://openrouteservice.org/services/

#### Erreichbarkeit ab einem Referenzpunkt
Zeigt ein Gebiet an, welches von einem ausgewählten Punkt auf der Karte innerhalb einer festgelegten Entfernung erreichbar ist. Die Entfernung kann in Zeit oder in Metern angegeben werden. Die Erreichbarkeit wird abhängig vom Verkehrsmittel berechnet. Die Polygone werden automatisch angepasst, wenn das Verkehrsmittel oder andere Parameter geändert werden.  
  
Das Modul kann verwendet werden, ohne vorherige Gebietsauswahl.
  


![Abbildung 1: Erreichbarkeit ab einem Referenzpunkt](https://user-images.githubusercontent.com/43250699/157067677-5f5db4a7-498a-45b2-8c06-6f2ea5ed6cbf.png)

*Abbildung 1: Erreichbarkeit ab einem Referenzpunkt*
  
1. **Auswahl des Modus**
   > Art der Einrichtungsanalyse. Ab einem Referenzpunkt oder Erreichbarkeit der gewählten Einrichtungen.
2. **Referenzpunkt setzen**
   > Durch Klicken auf der Karte wird der Punkt gesetzt, von dem aus berechnet wird.
3. **Verkehrsmittel festlegen** 
   > Das Verkehrsmittel wird ausgewÃ¤hlt aus einer Liste. Folgende Verkehrsmittel stehen aktuell zur Verfügung: Auto, Rad, Rad (elektrisch), Gehen, Rollstuhl.
4. **Maßeinheit der Entfernung festlegen**
   > Festlegen, ob die Entfernung in Minuten oder in Metern angegeben wird
5. **Entfernung**
   > Entfernung in zuvor festgelegter Maßeinheit (Minuten oder Metern) angeben
6. **Berechnen**
7. **Ergebnis ausblenden**
   > Die Ergebnisdarstellung auf der Karte wird ausgeblenden.
8. **Einwohnerabfrage**
   > (s. Einwohnerabfrage)
9. **Legende & Polygone**
   > Eine Legende wird eingeblendet. Sie wird dynamisch für die Heatmap generiert und zeigt drei gleichmäßig verteilte Entfernungswerte. Höchstwert ist der zuvor eingegebene Wert für die Entfernung. Die Polygone in der Karte sind entsprechend der Legende eingefärbt.
   Sie zeigen das, vom Referenzpunkt aus, erreichbare Gebiet abhängig von den zuvor eingegebenen Parametern als Heatmap.
10. **Pagination**
   > Sie können mehrere Erreichbarkeitsanalysen erstellen, die über die sog. [Pagination](./pagination.md) verwaltet wird. Hier finden Sie mitunter auch Funktionen, die in älteren Versionen teilweise woanders in den Werkzeugen waren.


#### Erreichbarkeit im Gebiet
Zeigt die Abdeckung und Erreichbarkeit von einer zuvor festgelegten Einrichtungsart (z.B. Kindergärten) in dem festgelegten Einzugsbereich (Planungsgebiet). Der Einzugsbereich ist die Entfernung von der jeweiligen Einrichtung und kann angegeben werden in Zeit oder in Metern. Die Erreichbarkeit ist abhÃ¤ngig von dem festgelegten Verkehrsmittel.

![Abbildung 2: Erreichbarkeit ausgewÃ¤hlter Einrichtungen im Gebiet](https://user-images.githubusercontent.com/43250699/157067851-a2c165c4-894c-4b3f-80a9-4bc626516771.png)

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
6. **Tageszeit**
   > Wenn Sie als Verkehrsmittel "Auto" ausgewählt haben, können Sie hier die Tageszeit auswählen, zu der Sie die Erreichbarkeit planen wollen.
7. **Verkehrsfluss berücksichtigen**
   > Wählen Sie aus, ob Sie den Verkehrsfluss berücksichtigen wollen oder nicht. 
8. **Von Flächenaußengrenzen ermitteln**
   > Wenn Sie einen Datensatz ausgewählt haben, wie bspw. "Grünflächen" oder ähnliches, dann wird die Erreichbarkeitsanalyse von der Außengrenze dieser Fläche durchgeführt.
9. **Legende und Probleme**
   > Eine Legende wird eingeblendet. Sie wird dynamisch für die Heatmap generiert und zeigt drei gleichmäßig verteilte Entfernungswerte. Höchstwert ist der zuvor eingegebene Wert für die Entfernung. Die Polygone in der Karte sind entsprechend der Legende eingefärbt. Sie zeigen das, vom Referenzpunkt aus, erreichbare Gebiet abhÃ¤ngig von den zuvor eingegebenen Parametern als Heatmap.
10. **Ergebnis ausblenden** 
11. **Legende und Probleme**
   > Eine Legende wird eingeblendet. Sie wird dynamisch für die Heatmap generiert und zeigt drei gleichmäßig verteilte Entfernungswerte. Höchstwert ist der zuvor eingegebene Wert für die Entfernung. Die Polygone in der Karte sind entsprechend der Legende eingefärbt. Sie zeigen das, vom Referenzpunkt aus, erreichbare Gebiet abhÃ¤ngig von den zuvor eingegebenen Parametern als Heatmap.
12. **Pagination**
   > Sie können mehrere Erreichbarkeitsanalysen erstellen, die über die sog. [Pagination](./pagination.md) verwaltet wird. Hier finden Sie mitunter auch Funktionen, die in älteren Versionen teilweise woanders in den Werkzeugen waren.