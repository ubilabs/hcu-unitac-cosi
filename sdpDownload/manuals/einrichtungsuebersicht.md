### Einrichtungsübersicht
![Abbildung 29: Einrichtungsübersicht](../utils/assets/screenshots/einrichtungsuebersicht.png)
*Abbildung 29: Einrichtungsübersicht*

In der Einrichtungsüberischt können Einrichtungen der aktiven Fachdaten-Themen ([Einrichtungsübersicht](#markdown-header-einrichtungsübersicht)) angezeigt, ausgewertet und exportiert werden. Dazu wird gegenwärtig das Feature **Standortbewertung** entwickelt, die die Möglichkeit bietet die Qualität einer Lokalität im Hinblick auf verschiedene Kriterien zu überprüfen.

1. **Detailansicht ein-/ausklappen**
   > Über den Pfeil können *alle* Attribute einer Einrichtung aufgeklappt werden. Die einzelnen Zeilen der Detailansicht können für den weiteren Export ausgewählt werden.
2. **Einrichtung auswählen**
   > Einrichtungen für den Export auswählen. Ausgewählte Einrichtungen werden in der Karte visuell hervorgehoben.
3. **Einrichtung fokussieren**
   > Durch einen Klick auf das Symbol zoomt die Karte zu der betreffenden Einrichtungen. Die Einrichtung wird in der Karte visuell hervorgehoben.
4. **Einrichtung ein-/ausblenden**
   > Einrichtungen können in der Karte ein- und ausgeschaltet werden. Ausgeschaltete Einrichtungen werden bei allen anderen CoSI-Funktionen nicht berücksichtigt.
5. **Einrichtungsattribute**
   > - Einrichtungsname, Adresse, Layer, Typ und Thema werden dem Datensatz direkt entnommen
   > - Die Gebietszuweisung wird dynamisch für die aktuelle Verwaltungsebene generiert
   > - Symbole zeigen an, wenn eine Einrichtung simuliert oder modifiziert wurde.
6. **Numerische Attribute**
   > Alle Attribute einer Einrichtung, die Zahlwerte abbilden (welche auch für die [Versorgungsanalyse](./versorgungsanalyse.md) verwendet werden können) werden in einer eigenen Spalte dargestellt. Die Farbe des Balkens richtet sich dabei nach dem Dezil des Wertes in der Liste aller Einrichtungen. Die Länge des Balkens ist proportional zum Höchstwert.
7. **Einträge sortieren**
   > Alle Spalten können, durch mehrmaliges Klicken auf die Kopfzeile, auf- und absteigend sortiert werden (alphabetisch oder nach Wert). Dabei kann für max. 2 Spalten erfolgen (z.B. 1. nach Typ und 2. nach numerischem Wert).
8. **Durchschnittliche Anbindung (in m)**
   > Die Anbindungsspalte zeigt die durchschnittliche Laufdistanz (in m) zu den jeweils nächstgelegenen Einrichtungen der ausgewählten Typen. Durch einen Klick auf den Wert kann die entsprechende Aufschlüsselung geöffnet werden (s. 12.).
9.  **Themenfilter**
      > Über kann die Tabelle nach Fachdatenlayern gefiltert werden. Die Liste kann im Freitext durchsucht werden.
10. **Einträge durchsuchen**
      > Die Tabelle kann nach beliebigen Freitexten durchsucht werden (schließt auch die Detailansichten ein).
11. **Tabelle exportieren**
      > Die ausgewählten Einträge als XLSX für Excel exportieren. Über aus Auswahlfeld *Detailansicht exportieren* können alle bzw. in der Detailansicht ausgewählte Attribute eines Einrichtungstyps exportiert werden. Ist keine Auswahl getroffen, werden alle Einrichtungen exportiert.
12. **Standortbewertung: Themenauswahl**
   *(Das Werkzeug befindet sich in der Entwicklung)*
      > Erlaubt die Auswahl beliebiger weiterer Fachdatenthemen für eine Standortbewertung. Bei Fachdaten, welche Punkte oder Flächen in der Karte repräsentieren (i.d.R. Einrichtungen) wird der Ort des Typs gefunden, welcher jeder Einrichtung in der Tabelle am nächsten ist und die Laufdistanz in Metern angegeben. Bei er Auswahl mehrerer Themen wird ein gewichteter Mittelwert gebildet (s. 8./13.). Andere Themen, z.D. Lärmkarte, Luftqualität, etc.) für die Bewertung befinden sich im Aufbau.
13. **Standortbewertung: Gewichtung**
   *(Das Werkzeug befindet sich in der Entwicklung)*
      > Erlaubt die Gewichtung der Themen für die Standortbewertung. Ein Thema mit Wert 0,5 wird somit nur halb so stark in den Mittelwert einbezogen, wie eines mit dem Wert 1.
