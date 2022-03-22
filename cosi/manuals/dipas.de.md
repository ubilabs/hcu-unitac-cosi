### DIPAS
Mit dem DIPAS Werkzeug können alle Beiträge aus laufenden DIPAS Verfahren in der Karte visualisiert, nach verschiedenen Kriterien dargestellt und für alle CoSI-Werkzeuge verfügbar gemacht werden. D.h. alle Beiträge können in der [Einrichtungsübersicht](./einrichtungsuebersicht.md) angezeigt, für [Versorgungsanalyse](./versorgungsanalyse.md), [Erreichbarkeitsanalyse](./erreichbarkeitsanalyse.md) und [Vergleichbare Gebiete Ermitteln](./vergleichbaregebieteermitteln.md) verwendet und mit dem [Filter](./filter.pdf) gefiltert werden.


![Abbildung 14: DIPAS](https://user-images.githubusercontent.com/43250699/159553679-c957f150-298f-476a-83ea-73ee854f5f61.png)

*Abbildung 14: DIPAS*

1. **Beteiligungsverfahren auswählen**
   > Für jedes Verfahren aus der DIPAS-Datenbank wird automatisch eine Registerkarte angelegt, welche durchs Anklicken aufgeklappt werden kann. Ein aufgeklapptes Verfahren zeigt dessen Beschreibungstext und die Kontrollfelder für die Visualisierung. Jedem Verfahren wid dabei eine zufällige Farbe zugewiesen.
2. **Indikator**
   > Das Icon in dem Indikator zeigt zum einen die Farbe an, in dem der jeweilige Datensatz visualiert wird, als auch, ob der Datensatz gerade auf der Karte angezeigt wird oder nicht.
3. **Legende**
   > Die Legende zeigt an, welcher Eintragstyp welche Farbe in der Visualierung hat.
4. **Verfahren in der Karte anzeigen**
   > Zeigt das Verfahrensgebiet als Polygon in der Karte in der jeweiligen Farbe des Verfahrens.
   - **4.1 Auf der Karte anzeigen**
      > Die Kartenansicht fokussiert auf das jeweilige Verfahrengebiet.
5. **Einzelne Beiträge in der Karte anzeigen**
   > Zeigt alle Einzelbeiträge des Verfahrens in der Karte. Das Styling der Beiträge kann unten (s. 5.) festgelegt werden.
6. **Heatmap in der Karte anzeigen** 
   > Zeigt eine Heatmap der Beiträge in der Karte. Das Gewicht eines Punktes richtet sich dabei nach der Gesamtzahl der Bewertungen des Beitrags, also der Stärke der Resonanz auf ihn.
7. **Styling der Beiträge wählen**
   > - nach Projekt: Alle Beiträge werden gleichmäßig in der Projektfarbe dargestellt.
   > - nach Kategorien im Projektfarbraum: Jede Kategorie wird in einer Schattierung der Projektfarbe dargestellt.
   > - nach Kategorien im Regenbogenspektrum: Jeder Kategorie wird eine zufällig Farbe zugewiesen.
   > - nach Bewertung: Die Beiträge werden abhängig von den positiven- und negativen-Bewertungen dargestellt. Die Größe des Punktes richtet sich dabei nach der Gesamtzahl der Reaktionen, die Farbe nach dem Verhältnis von positiven (grün) und negativen (rot) Bewertungen.
8. **Download als GeoJson**
   > Die aktuell aktiven DIPAS Datensätze werden als GeoJson heruntergeladen.
9. **Automatisches Update**
   > Wenn diese Checkbox aktiviert ist, werden die DIPAS Daten ggf. live aktualisiert.
10. **Beiträge in der Karte**
      > Alle Beiträge werden mit ihrer ID (einer fortlaufenden Nummer) in der Karte dargestellt.