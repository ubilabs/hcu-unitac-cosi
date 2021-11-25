## Versorgungsanalyse
___
Mit diesem Werkzeug kann das Verhältnis zweier Datensätze zueinander berechnet werden. Die Datensätze können entweder regionalstatistische Daten oder Einrichtungsdaten aus dem Menü "Themen/ Fachdaten" sein. Damit die Versorgungsanalyse verwendet werden kann, müssen mindestens zwei Datensätze geladen worden sein.


![Abbildung 1: Versorgungsanalyse, Einstellungen](https://user-images.githubusercontent.com/43250699/142926985-dfc8c2f9-c652-49f5-8f92-64a985a64f5e.jpg)

*Abbildung 1: Versorgungsanalyse, Einstellungen*

1. **Info** 
   > Über den Button finden Sie zu dieser Anleitung.
2. **Typ bestimmen**
   > Mit Klick auf den Button wechseln Sie zwischen Themendatensätzen (hier auch "Einrichtungen") und statistischen Regionaldaten.
3. **Thema/ Datensatz auswählen**
   > Wählen Sie das Thema/ den Datensatz aus, den Sie verrechnen möchten.
4. **Faktor F hinzufügen**
   > Bei Einrichtungsdatensätzen können Sie einen *Faktor (F)* angeben, der bestimmt, wie viele Einheiten der ausgewählten Einrichtung für den Referenzdatensatz benötigt werden. Wollen Sie beispielsweise die Anzahl der öffentlichen Schulen gegen die Anzahl der Bevölkerung unter 18 Jahren rechnen und geben einen Faktor von 0,001 an, würde das bedeuten, dass eine Schule pro 1000 Mitglieder der Referenzgruppe benötigt wird. Ist ein *Faktor (F)* angegeben, werden die Spalten "Kapazität" und "Bedarf" in der Berechnungstabelle mit angegeben.
5. **Parameter auswählen** 
   > Manche Einrichtungsdatensätze haben andere Parameter, als nur ihre Anzahl in den ausgewählten Gebieten. So kann man bei öffentlichen Schulen beispielsweise den Datensatz "Schülerzahl" abfragen oder bei Krankenhäusern die Anzahl der stationären Plätze. Nicht jeder Einrichtungsdatensatz bietet zusätzliche Parameter.
7. **Auswahl vertauschen**
   > Mit einem Klick auf diesen Button können Sie Ihre Auswahl von Feld (1) und (2) vertauschen.
8. **Die gesamte Auswahl zurücksetzen**
9. **Berechnen**

![Abbildung 2: Versorgungsanalyse, Ergebnisse](https://user-images.githubusercontent.com/43250699/142927798-bbd05b05-8a7c-46cc-8790-20a263f04f59.jpg)

*Abbildung 2: Versorgungsanalyse, Ergebnisse*

1. **Als Excel Datei downloaden**
2. **Als GeoJSON downloaden**
3. **Daten als Chart visualisieren**
   > Die Daten werden zum [Chartgenerator](./chartgenerator.md) geladen und dort als Graphen visualisiert.
4. **Auf der Karte visualisieren**  
      - Die Daten werden auf der Karte visualisiert in unterschiedlichen Farben visualisiert.
      - **4.1** Wählen Sie die Tabellenspalte aus, die auf der Karte visualisiert werden soll.
      - **4.2** Wählen Sie das Jahr aus, für das die regionalstatistischen Daten zur Berechnung herangezogen werden sollen. Wählen Sie hier ein anderes Jahr aus, aktualisieren sich auch die berechneten Ergebnisse in der Tabelle entsprechend.
5. **Ergebnistabelle**  
      - **Gebiet:** Die ausgewählten Gebiete, für die die Ergebnisse berechnet wurden. Hier finden sich auch die Indikatoren für die Zeilen "Gesamt" und "Durchschnitt".
      - **Auswahlfeld (1):**  
         Der Wert für den in Auswahlfeld (1) gewählten Datensatz.
      - **Auswahlfeld (2):**  
         Der Wert für den in Auswahlfeld (2) gewählten Datensatz.
      **Verhältnis:**  
         Hier wurde der Wert des Auswahlfeldes (1) durch den Wert des Auswahlfeldes (2) geteilt.
      - **Bedarfsdeckung:**  
         Die Versorgungsabdeckung in Prozent, d.h. das Verhältnis zwischen der aus Auswahlfeld (1) ermittelten Kapazität und Auswahlfeld (2) im Gebiet. Wurde kein Faktor F ausgewählt, zeigt die Spalte das direkte Verhältnis beider Felder in Prozent an.
