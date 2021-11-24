# CoSI 
___
## Cockpit Städtische Infrakstrukturen
___
#### GIS + datenbasierte Analyse- und Planungstools in der Hamburger Stadtverwaltung


### Nutzerhandbuch
---
#### 2. Phase (Weiterentwicklung)
### Version 2.0
#### Zur Internen Nutzung


### Autoren
Daniel Schulz, HafenCity Universität Hamburg  
Sebastian Duden, Landesbetrieb für Geoinformation und Vermessung Hamburg  
Ogeigha Koroyin, HafenCity Universität Hamburg  
Nicola Stradtmann, HafenCity Universität Hamburg  
Johanna Fleischer, Hafen City Universität  
Yuxiang Zhang, HafenCity Universität Hamburg  

### Stand
11/22/2021

### Keywords
GIS, Dashboard, Data Driven Urban Planning, Social Infrastructure, Urban Data Platform, Data Visualization, Planning Support Tools, Demand Driven Decision Making  

## Zusammenfassung
Bei der Planung städtischer und sozialer Infrastruktur sind Entscheidungsprozesse in der öffentlichen Verwaltung häufig durch langwierige Verfahren und eine fragmentierte Datengrundlage charakterisiert. D.h. Bedarfe werden teilweise  spät erkannt, oder die Konkretisierung der Planung verzögert sich durch das aufwendige Beschaffen von strukturierten Informationen.\
Das vorliegende Handbuch beschreibt das *Cockpit Städtische Infrastrukturen* für Hamburg als digitales Analyse- und Planungswerkzeug, welches mithilfe eines leicht zugänglichen User-Interface statistische und georeferenzierte Daten bündelt, visualisiert und integriert, um Planungsbedarfe zu identifizieren und Planungsprozesse zu beschleunigen.  
  
Dazu wurden die durch die *Urban Data Platform* der Stadt Hamburg aufgebauten Datenbankstrukturen genutzt, um eine kartenbasierte Webapplikation zu etablieren, welche den Sozialraumplanern der Stadt eine Reihe von Analysefunktionen zur Verfügung stellt, um auf der Verwaltungsebene der statistischen Gebiete soziodemographische Zusammenhänge zu identifizieren, Trends zu erkennen sowie Verhältnisse zwischen dem existierenden Infrastrukturangebot und den relevanten Zielgruppen zu ermitteln. Das Werkzeug soll im Folgenden helfen, Standorte und Potentiale für die Entwicklung von Infrastruktur zu finden. Die Ergebnisse dieser Analysen können direkt aus CoSI heraus visualisiert und als Entscheidungs- und Diskussionsgrundlage verwendet werden. Der Workflow folgt dabei einer dreistufigen Logik von der *Visualisierung* von Daten, über die *Analyse*, also der kontextuellen Verknüpfung von Information, bis zur *Simulation* von Maßnahmen und Ableitung ihrer  Auswirkungen.  
  
Um die technischen und inhaltlichen Anforderungen des Initialisierungs-Projekts aufzustellen, wurden im Vorfeld ab Sommer 2018 eine Reihe von Stakeholder- und Userstory-Workshops mit den Mitgliedern der Hamburger Verwaltung auf verschiedenen Ebenen durchgeführt. CoSI wurde dann ab August 2019 in einem agilen Verfahren, basierend auf der SCRUM-Methode, durch ein interdisziplinäres Team der HCU Hamburg und des LGV Hamburg entwickelt und stand den Sozialraumplanern des Bezirks Hamburg Nord seit dem 28.01.2020 bis Mai 2020 als Pilot im internen Verwaltungsnetzwerk zur Verfügung. Mitte 2020 wurde das Verfahren nach erfolgreicher Evaluation in den Produktivbetrieb überführt und steht seitdem bereits mehreren tausend Mitarbeiterinnen und Mitarbeitern zur Verfügung. Das seit dem 01.02.2021 gestartete Weiterentwicklungsprojekt hat das Ziel, bestehende Funktionen zu verbessern und neue Funktionen zu integrieren. Hierzu zählt insbesondere der "Blick nach vorne" durch die Entwicklung einer Simulationsfunktion.  
  

## Inhalt
___
- [CoSI](#cosi)
  - [Cockpit Städtische Infrakstrukturen](#cockpit-städtische-infrakstrukturen)
      - [GIS + datenbasierte Analyse- und Planungstools in der Hamburger Stadtverwaltung](#gis--datenbasierte-analyse--und-planungstools-in-der-hamburger-stadtverwaltung)
  - [### Nutzerhandbuch](#-nutzerhandbuch)
      - [2. Phase (Weiterentwicklung)](#2-phase-weiterentwicklung)
    - [Version 2.0](#version-20)
      - [Zur Internen Nutzung](#zur-internen-nutzung)
    - [Autoren](#autoren)
    - [Stand](#stand)
    - [Keywords](#keywords)
  - [Zusammenfassung](#zusammenfassung)
  - [Inhalt](#inhalt)
  - [Datenmodell & -Infrastruktur](#datenmodell---infrastruktur)
    - [Regionalstatistische Daten](#regionalstatistische-daten)
    - [Fachdaten](#fachdaten)
    - [Analyse](#analyse)
    - [Darstellung](#darstellung)
    - [Geodienste](#geodienste)
    - [WMS](#wms)
    - [WFS](#wfs)
  - [Module](#module)
    - [Überblick](#überblick)
    - [Themen (Layer)](#themen-layer)
    - [Analyse](#analyse-1)
    - [Einwohnerabfrage](#einwohnerabfrage)
    - [Erreichbarkeitsanalyse](#erreichbarkeitsanalyse)
      - [Erreichbarkeit ab einem Referenzpunkt](#erreichbarkeit-ab-einem-referenzpunkt)
      - [Erreichbarkeit im Gebiet](#erreichbarkeit-im-gebiet)
    - [Vergleichbare Gebiete ermitteln](#vergleichbare-gebiete-ermitteln)
    - [Filter](#filter)
    - [Versorgungsanalyse](#versorgungsanalyse)
    - [Simulation](#simulation)
    - [Einrichtungen anlegen](#einrichtungen-anlegen)
      - [Szenario Manager](#szenario-manager)
      - [Schrittweises Vorgehen](#schrittweises-vorgehen)
    - [Wohnungsbauquartiere anlegen](#wohnungsbauquartiere-anlegen)
        - [**Die Parameter in den Feldern passen sich der gezeichneten Fläche an:**](#die-parameter-in-den-feldern-passen-sich-der-gezeichneten-fläche-an)
      - [Schrittweises Vorgehen](#schrittweises-vorgehen-1)
    - [Dienste](#dienste)
    - [Geodaten Importieren](#geodaten-importieren)
      - [Styling](#styling)
      - [Einrichtungsdaten](#einrichtungsdaten)
      - [Filterdaten](#filterdaten)
      - [Numerische Werte](#numerische-werte)
    - [Zweites Fenster](#zweites-fenster)
    - [Dashboard](#dashboard)
    - [Statistische Datenübersicht](#statistische-datenübersicht)
    - [Einrichtungsübersicht](#einrichtungsübersicht)
    - [Gebietsauswahl](#gebietsauswahl)
    - [Kartenanalyse regionalstatistischer Daten](#kartenanalyse-regionalstatistischer-daten)
    - [Chartgenerator](#chartgenerator)

## Datenmodell & -Infrastruktur
___
  
CoSI basiert im Kern aus der Überlagerung regelmäßig aktualisierter regionalstatistischer Kenndaten der einzelnen Gebietsebenen, welche vom Statistikamt Nord für Hamburg und Schleswig-Holstein (StaNord ) geliefert werden, und verschiedenster Fachdaten der unterschiedlichen Behörden und Ämter, wie z.B. dem digitalen Grünplan (BUKEA) oder den Öffentlichen Schulen (BSB). Dabei versucht CoSI mehr als nur die Darstellung der Datensätze in Karte und Tabelle neben- und übereinander zu gewährleisten. Der Anspruch ist es, eine Integration der Daten und eine Interaktion mit den Daten zu erreichen. Also einerseits Zusammenhänge und Wechselwirkungen zwischen verschiedenen Datensätzen für die Nutzerinnen und Nutzer erfahrbar zu machen und andererseits diesen zu erlauben in die Datensätze "einzugreifen", sie zu filtern, zu durchsuchen oder zu "manipulieren". Letzteres, die Echtzeit-Veränderung von Datensätzen im laufenden Programm (s. Simulation) wird aktuell im laufenden Weiterentwicklungsprojekt konzipiert bzw. umgesetzt.

  
    

### Regionalstatistische Daten
Die Daten des StaNord liegen für alle Verwaltungsebenen der FHH (statistische Gebieten, Stadtteile, Bezirke und die Gesamtstadt) vor. Sie umfassen je nach Ebene über 60 Indikatoren, welche sich in folgende Kategorien gliedern:  

   - Bevölkerung
   - Fläche
   - Haushalte
   - Sozialversicherungspflichte
   - Arbeitslose
   - SGB II Leistungen
   - Grundsicherung im Alter
   - Wohnen
   - Verkehr

Diese Datensätze beinhalten je Zeitreihen, welche von (je nach Datensatz) ca. 2012 an erfasst sind und jährlich erweitert werden.

*Hinweis: Aus datenschutzrechtlichen Gründen werden bereits vom Datenbereitsteller solche Datensätze herausgefiltert, welche bei sensiblen Daten auf einzelne Individuen zurück verfolgbar wären. Diese Datensätze sind im "–" oder mit "Keine Daten" ausgewiesen.*

### Fachdaten
Die Fachdatensätze, welche derzeit in CoSI eingebunden sind oder noch eingebunden werden können, werden als Geodienste von unterschiedlichsten Dateneignern (v.a. Behörden, aber prinzipiell auch Privatunternehmen, Echtzeitsensoren, etc.) bereitgestellt und in CoSI, wie im FHH-Atlas, über die URL des jeweiligen Dienstes abgerufen. Viele der Datensätze in ihrer aufbereiteten Form sind aus den Verhandlungs- und Koordinationsprozessen des Urban Data Hub hervorgegangen, über den sich die Behörden und Datenhalter der FHH auf gemeinsame Standards und regelmäßige Veröffentlichungen verständigen.

### Analyse
Analysedaten sind all jene (als WFS, s. Geodienste) eingebundenen Datensätze, welche für die Verwendung mit den CoSI-Analyse- (und in Zukunft Simulations-) Werkzeugen konfiguriert wurden. D.h. jedes Objekt (Feature, z.B. Kita oder Grünfläche) ist dabei einzeln hinterlegt und kann mit seiner geografischen Position und Ausdehnung betrachtet werden.

### Darstellung
Darstellungsdaten sind auf Absprache mit den Fachplanerinnen und Fachplanern ausgewählte Datensätze aus dem FHH-Netz, welche durch das zugrundeliegende Geoportal (Masterportal) in der Karte visualisiert und mit einer Legende versehen werden. Per Klick kann der Datensatz für die jeweilige Koordinate aus dem Datensatz abgerufen werden. Im Gegensatz zu den Analysedaten liegen die Darstellungsdaten gegenwärtig nicht als einzelne Objekte, sondern als gekacheltes/gerastertes Bild vor (WMS, s. Geodienste).

### Geodienste
Alle in CoSI und dem FHH-Atlas dargestellten Daten werden von den Bereitstellern als Dienst vorgehalten. Der Dienst liefert über eine URL Datensätze der jeweiligen Datenbank in einem maschinenlesbaren Format. Über zusätzliche Parameter kann die Anfrage (Request) spezifiziert oder (z.B. auf einen geografischen Ausschnitt) eingegrenzt werden. 

### WMS
Ein WMS (Web Map Service) liefert Geodaten / Karten als Rasterbilder (PNG), welche zunächst einmal ohne Hintergrundinformation in der Karte angezeigt werden. Gleichzeitig können die Legende des Datensatzes oder Informationen zu einer bestimmten Koordinate über weitere Requests abgerufen werden.

### WFS
Der WFS (Web Feature Service) liefert im Gegensatz zum WMS keine fertige Kartenansicht, sondern ein rohes Datenobjekt, bei dem der Datensatz jedes geografischen Objekts (Punkt, Linie, Fläche, etc.) inkl. seiner Attribute (z.B. eine Schule mitsamt ihrem Schultyp, ihrer Schülerzahl, Mailadresse und Nachmittagsangebot) einzeln übermittelt. Die Visualisierung (das Styling) der Daten erfolgt dann anhand vorgegebener oder mitgelieferter Konfigurationen innerhalb der Applikation. Dies ist rechenintensiver für den Anwendenden und weniger kontrollierbar von Seiten des Datenbereitstellers, bietet jedoch die Möglichkeit mit den Objekten innerhalb des Portals direkt zu interagieren oder sie zu verändern.  

  

___


## Module
___
### Überblick 
CoSI bietet verschiedene Module (nachfolgend oft auch als "Werkzeuge" oder "Tools" bezeichnet" an, die bestimmte Funktionen zur Erstellung, Verwaltung und Analyse von Daten bereitstellen. Nachfolgend finden Sie die Übersicht über alle im UI zur Verfügung stehenden Funktionen:

![Abbildung 1: Das CoSI Nutzer-Interface](https://user-images.githubusercontent.com/43250699/142911085-50a9fe73-0171-47d0-b2f9-527593ae42ed.jpg)

*Abbildung 1: Das CoSI Nutzer-Interface*

1. **Themenbau/ Layer** (s. Themen)
2. **Analyse**
      1. [Einwohnerabfrage](#markdown-header-einwohnerabfrage)
      2. [Erreichbarkeitsanalyse](#markdown-header-erreichbarkeitsanalyse)
      3. [Vergleichbare Gebiete ermitteln](#markdown-header-vergleichbare-gebiete-ermitteln)
      4. [Filter](#markdown-header-filter)
      5. Strecke/ Fläche messen
      6. [Versorgungsanalyse](#markdown-header-versorgungsanalyse)
      7. [DIPAS](#markdown-header-dipas)

3. **Simulationsfunktionen**
      1. [Einrichtungen anlegen](#markdown-header-einrichtungen-anlegen)
      2. [Wohnungsbauquartiere anlegen](#markdown-header-wohnungsbauquartiere-anlegen)

4. **Dienste**
      1. Zeichnen/ Schreiben
      2. Karte drucken
      3. Mousehover ein-/ ausschalten
      4. [Geodaten Importieren](#markdown-header-geodaten-importieren)
      5. WMS hinzufügen
      6. [Zweites Fenster öffnen](#markdown-header-zweites-fenster)
      7. [Sitzung speichern/laden](#markdown-header-sitzung-speichern)
      8. [Vorlagen](#markdown-header-vorlagen)

5. **Dashboard**
      1. Statistische Datenübersicht
      2. Einrichtungsübersicht
6. **[Gebiete auswählen](#markdown-header-gebiete-auswählen)**
7. **Kontaktformular**
8. **Legende** (s. Legende)
9. **Suchleiste**
10. **Werkzeugfenster**
   > Aktive Werkzeuge werden in verschiebbaren Fenstern angezeigt.
11. **Hereinzoomen**
12. **Herauszoomen**
13. **Vollbildansicht aktivieren/ deaktivieren**
14. **Zurück zur Startansicht**
15. **Barrierefreie Ansicht** (fette Linien)
16. **[Kartenanalyse regionalstatistischer Daten](#markdown-header-kartenanalyse-regionalstatistischer-daten)**
17. **Tooltip** (sog. Mousehover)
   > Zeigt das Gebiet und andere Elemente wie Tooltipps unter dem Mauszeiger an. Kann unter "Dienste" via "Mousehover ein-/ausschalten" deaktiviert werden.
18. **Ausgewählte Gebiete**
   > Ausgewählte Gebiete werden dargestellt mit einer blauen Umrandung.
19. **Sidebar**
   > Das Dashboard und der Filter werden in einer Sidebar angezeigt. Die Sidebar kann in ihrer Breite angepasst werden. (s. Dashboard)


### Themen (Layer)
___
Layer können aus dem Reiter "Themen" jederzeit zugeschaltet oder ausgeschaltet werden. Die Themen sind unter dem Reiter Fachdaten sortiert. Beim Zuschalten sollte mit bedacht werden, dass sich Ladezeiten entsprechend verlängern können. Verzögerungen können vorkommen, wenn zu Beginn kein Planungsgebiet festgelegt wurde. Dann müssen die Daten für das gesamte Hamburger Gebiet geladen werden. 

Der Themenbaum ist gegliedert in Hintergrundkarten, einen Katalog an Fachdaten und die aktuelle Auswahl an Kartenebenen.

![Abbildung 2: Der Themenbaum](https://user-images.githubusercontent.com/43250699/142911438-557f70eb-579d-44d4-827e-4f500149e16a.png)

*Abbildung 2: Der Themenbaum*

Öffnen Sie mit dem Plus die Übersicht der Themenkategorie oder minimieren sie die Ansicht wieder mit dem Minus.

1. **Hintergrundkarten**
   > Layer wie "Stadtkarte Hamburg", die als Standard automatisch aktiv sind, können auch deaktiviert werden. Die Hintergrundkarten orientieren sich am FHH Portal. Achtung beim An- und Ausschalten der Karten. Kartenlayer können andere Layer überlagern. Ihre Anzeige ist daher abhängig von der Reihenfolge der Aktivierung. Die Anordnung kann in "Ausgewählten Themen" noch nachträglich verändert und angepasst werden.
2. **Fachdaten**  
	 - **Analyse/Simulation**
      > Die aufbereiteten Layer für CoSI-spezifische Werkzeuge (bereitgestellt als WFS, s. Glossar). Die einzelnen Datenlayer sind in Kategorien eingeteilt, die regelmäßig angepasst bzw. aktualisiert werden.
	 - **Darstellung**
      > Daten zur reinen "Anzeige" in der Karte, v.a. entnommen aus dem FHH Atlas (bereitgestellt als WMS).
3. **Ausgewählte Themen**  
      ![Abbildung 3: Ausgewählte Themen](https://user-images.githubusercontent.com/43250699/142911886-03547719-aab0-4f80-a3e3-cfdca1267eb7.png)  
      *Abbildung 3: Ausgewählte Themen*  
      - **3.1 Informationen und Legenden**
      - **3.2 Einstellungen**  
         Über das Zahnrad öffnen sich Einstellungen für Transparenz und Ebene verschieben.
      - **3.3 Transparenz**  
         Die Transparenz lässt sich über Plus in Prozent erhöhen und über Minus verringern.
      - **3.4 Ebene nach oben/unten**  
         Über das Pfeilmenü kann die Ebene der Layer verschoben werden.
4. **Hilfsbutton**
   > Ruft diese Anleitung auf.
5. **Kartenhintergrund**
   > Hier können Sie für den Kartenhintergrund grau oder weiß auswählen.
6. **Themenbaum fixieren/ lösen**
   > Diese Funktion fixiert den Themenbaum, so dass er auch bei Interaktionen mit der Karte angezeigt bleibt.

Die Themen enthalten Informationen, die symbolisch oder durch Flächen auf der Karte dargestellt werden. In Abbildung 4 zum Beispiel stellen die Häuschen die vorhandenen Kindertagesstätten im Gebiet dar. Nummerierte Häuschen zeigen die Anzahl der an diesem Ort vorhandenen Einrichtungen an. Die lilafarbenen Linien stellen Flächen dar, die zum Layer Bebauungspläne gehören.
Eine Legende zu den aktiven Themen kann durch einen Klick auf den Reiter "Legende" eingeblendet werden. Unabhängig davon können über den Infobutton rechts neben dem Layer weitere Informationen zu dem jeweiligen Thema aufgerufen werden. Es werden folgende Informationen bereitgestellt: Kurzbeschreibung des Themas, Datenstand und Legende. Auch befinden sich hinter dem Info-Button die Links zu Downloadquellen und eine WFS - bzw. WMF -Adresse.
Ein Klick auf ein Objekt auf der Karte öffnet eine Infotafel für die aktuelle Auswahl (Sportstätte, Kita, etc.). Auf der Infotafel werden Informationen über das Objekt angezeigt. Datenschutzrelevante (personenbezogene) Daten werden nicht angezeigt.


### Analyse
___

![Abbildung 4: Analyse](https://user-images.githubusercontent.com/43250699/142912903-a76bb8e9-4626-4c76-8bf4-ac5cbc32e700.jpg)

*Abbildung 4: Analyse*

1. **[Einwohnerabfrage](#markdown-header-einwohnerabfrage)**
   > Adressgenaue Abfrage der Bevölkerungszahlen vom StaNord
2. **[Erreichbarkeitsanalyse](#markdown-header-erreichbarkeitsanalyse)**
   > Erreichbarkeiten auf Basis des Straßennetzes ermitteln  

   - Erreichbarkeit ab einem Referenzpunkt
   - Erreichbarkeit in einem Gebiet
3. **[Vergleichbare Gebiete ermitteln](#markdown-header-vergleichbare-gebiete-ermitteln)**
   > Gebiete in Hamburg nach Parametern auswählen
4. **[Filter](#markdown-header-filter)**
   > Fachdaten (Schulen, Grünflächen, etc.) nach Parametern filtern
5. **[Strecke / Fläche messen](#markdown-header-strecke-/-flaeche-messen)**
6. **[Versorgungsanalyse](#markdown-header-versorgungsanalyse)**
   > Verhältnis zwischen Einrichtungen (Fachdaten) und Zielgruppen (StaNord-Daten) im Gebiet ermitteln
7. **[DIPAS](#markdown-header-dipas)**
   > (In Entwicklung)  
  
### Einwohnerabfrage
Grundsätzlich bietet diese Funktion die Möglichkeit an, durch Aufziehen eines Rechtecks oder Kreises bzw. durch Einzeichnen einer Fläche die adressgenaue Einwohneranzahl zu bestimmen. Dieses Werkzeug stammt ursprünglich aus dem Masterportal und wurde u.a. in dem Modul "Erreichbarkeitsanalyse" integriert.

- Beim direkten Aufruf unter dem Reiter "Analyse" muss das Gebiet, über das man die Abfrage durchführen möchte, händisch festgelegt werden (via Rechteck oder Kreis ziehen bzw. via Zeichnen einer Fläche). 
- Bei der Nutzung innerhalb des Kontexts der Erreichbarkeitsanalyse muss das Gebiet nicht händisch festgelegt werden, sondern es wird als Gebiet das errechnete Einzugsgebiet übernommen.

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
  


![Abbildung 5: Erreichbarkeit ab einem Referenzpunkt](https://user-images.githubusercontent.com/43250699/142921422-5f9a0e75-5867-4fa9-bf63-fff42c02cb0d.jpg)

*Abbildung 5: Erreichbarkeit ab einem Referenzpunkt*
  
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

![Abbildung 7: Erreichbarkeit ausgewählter Einrichtungen im Gebiet](https://user-images.githubusercontent.com/43250699/142923253-c745b0d3-f698-4f6e-b744-cecf30981ff8.jpg)

*Abbildung 7: Erreichbarkeit ausgewählter Einrichtungen im Gebiet*

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
  


### Vergleichbare Gebiete ermitteln
Das Werkzeug erlaubt die Ermittlung aller Gebiete (Stadtteile oder statistische Gebiete), in denen die ausgewählten Parameter vorherrschen, bzw. solcher, die dem gewählten Referenzgebiet in diesen Parametern ähneln.
Wählen sie unter Filter die gewünschten Parameter für den Vergleich, sowie ein Referenzgebiet (optional).  

![Abbildung 8: Vergleichbare Gebiete ermitteln](https://user-images.githubusercontent.com/43250699/142924529-006f7d31-d1d3-4075-87bf-acd25e2e360d.jpg)   
 
*Abbildung 8: Vergleichbare Gebiete ermitteln*  

1. **Statistische Datenfilter**
   > Gewünschten Parameter für den Vergleich auswählen. Es können beliebig viele Parameter hinzugefügt werden. Alle StaNord-Datensätze sind hierfür verfügbar. Anteilige Werte eignen sich jedoch besser für die Vergleichbarkeit. Gegenwärtig können eigene Berechnungen aus dem Dashboard nicht herangezogen werden.
2. **Referenzgebiet**
   > Optional kann eins der ausgewählten Gebiete als Referenzgebiet angegeben werden.
3. **Parametereinstellungen**
   > Die Parametereinstellungen zeigen den aktuellen Datensatz (Jahr Min.- und Max.-Wert aller Hamburger Gebiete, den Referenzwert (frei wählbar oder des Referenzgebiets) sowie die Toleranz nach oben und unten. Das Toleranzintervall ist entweder in absoluten Zahlen oder in Prozent für anteilige Werte angegeben.
4. **Ergebnisse** 
   > Die zutreffenden Gebiete werden in der Karte markiert.  

![Abbildung 9: Vergleichbare Gebiete ermitteln, Ergebnisse](https://user-images.githubusercontent.com/43250699/142925184-b63f11b9-c209-472e-892e-552de7610705.jpg)  
*Abbildung 9: Vergleichbare Gebiete ermitteln, Ergebnisse*  

1. **Ergebnisse**
   > Eine Liste aller Gebiete, auf die die gewählten Kriterien zutreffen, wird im Fenster angezeigt. Ein Klick auf ein Gebiet legt den Kartenausschnitt auf dieses fest.
2. **Als Gebietsauswahl setzen**
   > Über *Ergebnis als Gebietsauswahl* setzen kann die aktuelle Gebietsauswahl für weitere Analysen auf die Ergebnis-Gebiete gesetzt werden.
3. **Im Dashboard anzeigen**
   > Die Ergebnisliste kann ins Dashboard übertragen werden, ohne die Gebietsauswahl zu verändern.  
  

### Filter
Die aktiven, ausgewählten Themen können durch Klick auf den Reiter "Filter" nach den Kategorien ihrer Datensätze durchsucht und gefiltert werden. Die Karte zoomt automatisch auf die Filterergebnisse. Es werden nur Ergebnisse in den ausgewählten Gebieten einbezogen. Der Filter ist für alle Fachdatensätze verfügbar, welche sinnvolle filterbare Attribute (wie Fläche, Nutzung, Träger, etc.) aufweisen.  

![Abbildung 10: Filter](https://user-images.githubusercontent.com/43250699/142924026-a46ada10-7289-4882-9b2e-c41528289930.jpg)

*Abbildung 10: Filter*  

1. **Ein Thema im Filter wählen**
   > Angezeigt werden die ausgewählten Themen. Themen können jederzeit hinzugefügt werden. Dazu Themenbau anklicken und Thema auswählen.
2. **Filteroptionen:**
    - es können mehrere Filteroptionen gewählt werden. Kennzeichnung der Auswahl erfolgt automatisch durch Haken. 
    - Schieberegler (von / bis): es kann z.B. eine gewünschte Flächengröße eingegeben werden.
3. **Ergebnis wird sofort mit Wahl der Filteroption angezeigt:**
    - Ergebnis wird in der Karte durch Symbol oder Flächenfarbe angezeigt. Durch Anklicken des Reiters "Legende” wird diese eingeblendet. Mousehover blendet Infofeld zu Einrichtung / Fläche ein.
    - Im Ergebnisfeld der Suche werden Namen der Gebiete / Einrichtungen angezeigt. Durch Anklicken der Namen wird die Auswahl in der Karte markiert. 
4. **Filter löschen:** 
   > Einzelne Auswahl durch Anklicken des roten "X" oder gesamte Auswahl löschen durch Anklicken des Buttons "Alle löschen”.


### Versorgungsanalyse
Mit diesem Werkzeug kann das Verhältnis zweier Datensätze zueinander berechnet werden. Die Datensätze können entweder regionalstatistische Daten oder Einrichtungsdaten aus dem Menü "Themen/ Fachdaten" sein. Damit die Versorgungsanalyse verwendet werden kann, müssen mindestens zwei Datensätze geladen worden sein.


![Abbildung 11: Versorgungsanalyse, Einstellungen](https://user-images.githubusercontent.com/43250699/142926985-dfc8c2f9-c652-49f5-8f92-64a985a64f5e.jpg)

*Abbildung 11: Versorgungsanalyse, Einstellungen*

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

![Abbildung 12: Versorgungsanalyse, Ergebnisse](https://user-images.githubusercontent.com/43250699/142927798-bbd05b05-8a7c-46cc-8790-20a263f04f59.jpg)

*Abbildung 12: Versorgungsanalyse, Ergebnisse*

1. **Als Excel Datei downloaden**
2. **Als GeoJSON downloaden**
3. **Daten als Chart visualisieren**
   > Die Daten werden zum [Chartgenerator](#markdown-header-chartgenerator) geladen und dort als Graphen visualisiert.
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


### Simulation
___
Das Modul Simulation bietet die Möglichkeit, fiktionale Einrichtungen oder Wohnungsbauquartiere hinzuzufügen und Analysen auf einer hypothetischen Grundlage durchzuführen.  
  
![Abbildung 13: Simulation](https://user-images.githubusercontent.com/43250699/142929647-1f8dd57a-fd18-4398-a0ca-19d8d110e0c0.jpg)  
*Abbildung 12: Simulation*  

1. **[Einrichtungen anlegen](#markdown-header-einrichtungen-anlegen)**
   > Hier können Sie verschiedene Themen auswählen und je nach Thema neue Einrichtungen erstellen, kopieren und verschieben. Dieses bietet die Grundlage, um in verschiedenen Szenarien Analysen durchzuführen. 
2. **[Wohnungsbauquartiere anlegen](#markdown-header-wohnungsbauquartiere-anlegen)**
   > In dieser Komponente ist es möglich, fiktionale oder zukünftige Wohnungsbauquartiere zu erstellen. Die dadurch erzeugten Parameter werden in weitere Analysen mit eingebunden. 

### Einrichtungen anlegen

Sobald sie "Einrichtungen anlegen" auswählen, öffnet sich ein Fenster, in dessen oberem Bereich Sie den Szenario Manager finden. Bei der Funktion "Wohnungsbauquartiere anlegen" befindet sich der Szenario Manager an derselben Stelle.

#### Szenario Manager
![Abbildung 14: Szenario Manager](https://user-images.githubusercontent.com/43250699/143022435-622e8032-e0da-4b5e-bd0c-9e33aa07de2c.png)  

1. **Scenario Dropdown**
   > Zeigt bisher erstellte Szenarien an.
2. **Neues Szenario anlegen**
   > Öffnet die Maske zur Erstellung eines weiteren
Szenarios.
3. **Szenario exportieren**
   > Stellt einen Download des Szenarios zur Verfügung
4. **Szenario Löschen**
   > Löscht das ausgewählte Szenario. 
5. **Szenario leeren**
   > Löscht alle Veränderungen im Szenario. 
6. **Thema auswählen**
   > Dropdownmenü erlaubt die Auswahl aus den aktivierten Fachthemen.  
  
 *Sie **müssen** ein Thema aus den geladenen Fachdaten wählen. Sind keine Fachdaten ausgewählt, ist kein Szenario möglich. Wählen Sie mindestens ein Analysethema aus dem Themenbaum.*  

![Abbildung 15: Einrichtungen anlegen](https://user-images.githubusercontent.com/43250699/143023574-324b2275-eea7-4926-bf3d-07c2f21124e1.png)  
*Abbildung 15: Einrichtungen anlegen*  

1. **Einrichtung kopieren**
   > Erlaubt den Upload eines gespeicherten Szenarios. 
2. **Verschieben der Einrichtung**
   > Erlaubt das Bewegen von Einrichtungen durch verschieben auf der Karte
3. **Sichern/ Öffnen** 
   > Ermöglicht geöffnet das Verschieben vorhandener Einrichtungen.
4. **Rückgängig** 
   > Stellt den vorherigen Zustand wieder her.
5. **Geometrie** 
   > Überträgt die Geometrie eines Punktes durch Klick auf der Karte.
6. **Löschen**
   > Entfernt vorhandene Geometrie.
7. **Erforderliche Spalten**
   > Notwendige Bedingung zur Erstellung einer simulierten Einrichtung.
8. **Kapitelbezeichnung**
9. **Name**
10. **Optionale Spalten**
   > Können bei Bedarf ergänzt werden.
11. **Anlegen**
   > Erstellt die simulierte Einrichtung
12. **Zurücksetzen**
   > Setzt das Szenario zurück.

#### Schrittweises Vorgehen
Zur besseren Verständlichkeit des Werkzeugs wird im Folgenden einmal Schritt für Schritt erläutert, wie man erfolgreich selbst eine neue Einrichtung anlegt.

1. #### **Schritt 1:** Neues Szenario erstellen
2. #### **Schritt 2:** Name für Szenario festlegen
3. #### **Schritt 3:** Einrichtung definieren
   1. Kopieren sie eine Einrichtung mit dem Pipetten-Symbol, indem sie zuerst die Pipette anklicken und dann die zu kopierende Einrichtung in der Karte anwählen. Sie können Einrichtungen auch vollständig manuell anlegen, indem Sie die dazu erforderlichen Spalten selbst ausfüllen. 
   2. Positionieren sie die Einrichtung auf der Karte, indem sie zunächst den "Ort wählen" Stift im Feld *Geometrie/ Ort* anklicken und dann einen Punkt auf der Karte anwählen. Alternativ können Sie die geometrischen Werte in das Feld Geometrie/Ort eintragen. 
   3. *Erforderliche Spalten* werden durch das Kopieren einer Einrichtung per Pipette übernommen. Diese Spalten können jedoch manuell ergänzt oder verändert werden. 
   4. *Optionale Spalten* werden automatisch durch das Kopieren einer Einrichtung übertragen können aber auch manuell ergänzt oder ausgefüllt werden .
4. #### **Schritt 4:** Einrichtung anlegen
   > Schließen sie die Erstellung ab, indem Sie den blauen Button "Neue Einrichtung Erstellen" klicken. Die neue Einrichtung erscheint als Icon in der Karte. Neue Einrichtungen werden durch ein farbiges Sternchen gekennzeichnet. 
5. #### **Schritt 5:** Einrichtung bewegen
   1. Zum Verschieben von Einrichtungen klicken sie das Bewegen-Symbol. Nun klicken sie die Einrichtung, die Sie bewegen möchten. Ist diese angeklickt, vergrößert sich das Symbol und zeigt damit an, dass die Einrichtung nun beweglich ist. Ziehen sie die Einrichtung mit gedrückter linker Maustaste an den gewünschten Platz. 
   2. Möchten sie bestehende Einrichtungen aus dem Datensatz auf der Karte verschieben, dann lösen Sie durch einen Klick auf das Schloss die Sperre. Es erscheint eine Warnung:   
   *"Achtung: Sie können jetzt auch echte Einrichtungen verschieben. Ihre Änderungen sind nur temporär und werden nach der Sitzung nicht gespeichert."*  

Alle Analysen, die innerhalb eines Szenarios durchgeführt werden, berücksichtigen die Parameter der simulierten Einrichtungen. 

### Wohnungsbauquartiere anlegen 

Durch das Erstellen eines Wohnbauquartiers können sie Wohnungsbauszenarien durchspielen. Die erstellten Wohnungsbauquartiere stehen Ihnen für weitere Analysefunktionen zur Verfügung. Die Szenarien können exportiert und gespeichert werden.

Sobald sie "Wohnungsquartiere anlegen" auswählen, öffnet sich ein Fenster, in dessen oberem Bereich Sie den Szenario Manager finden. (s. [Szenario Manager](#markdown-header-szenario-manager))

![Abbildung: 16: Wohnungsbauquartiere anlegen](https://user-images.githubusercontent.com/43250699/143025884-f86a5897-3757-4b35-9d6d-1e4969d8175d.png)  
*Abbildung 16: Wohnungsbauquartiere anlegen*

1. **Geometrie**
   > Mithilfe des Stiftes kann ein Polygon in der Karte gezeichnet werden. 
2. **Rückgängig**
   > Entfernt die zuvor gezeichnete Linie.
3. **Polygon in der Karte wählen**
   > Ist der Button orange markiert, kann auch ein Polygon aus der Karte angewählt und übernommen werden.
4. **Löschen**
   > Löscht das erstellte Polygon.
5. **Zurücksetzen**
   > Entleert die Eingabemaske, um weitere Wohnungsbauquartiere zu erstellen.
6. **Bearbeiten**
   > Ermöglicht die Anpassung der regionalstatistischen Datensätze.
7. **Anlegen**
   > Bestätigt die Angaben und erstellt das simulierte Wohnungsbauquartier.

##### **Die Parameter in den Feldern passen sich der gezeichneten Fläche an:**

- **Grundfläche**
   > Zeigt die Fläche des gezeichneten Polygons an. 
- **Bewohnerzahl insgesamt**
   > Zeigt die Einwohnerzahl entsprechend dem gewählten Referenzgebiet. 
- **Wohneinheiten**
   > Schieberegler lässt sich auf die gewünschte Anzahl an Wohneinheiten regeln. 
- **Bruttogeschossfläche (BGF)**
   > Regelt die verfügbare Bruttogeschossfläche. 
- **Durchschnittliche Haushaltsgröße**
   > Regelt die geplante Anzahl der Personen pro Wohneinheit. 
- **Geschossflächenzahl (GFZ)**
   > Reguliert die Anzahl an Flächen auf der gezeichneten Grundfläche. 
- **Bevölkerungsdichte**
   > Wird aus dem Referenzgebiet übernommen, kann jedoch durch Anpassung anderer Parameter variieren. 
- **Wohnfläche pro Person**
   > Reguliert die bereitgestellte Wohnfläche pro Kopf. 

#### Schrittweises Vorgehen
Zur besseren Verständlichkeit des Werkzeugs wird im Folgenden einmal Schritt für Schritt erläutert, wie man erfolgreich selbst ein neues Wohnungsquartier anlegt.

1. **Schritt 1:** Geben Sie einen Namen für das erstellte Wohnbauquartier ein 
2. **Schritt 2:** Zeichnen Sie mit dem Zeichenstiftwerkzeug den Wohnblock an der gewünschten Fläche ein oder wählen Sie ein Polygon auf dem Kartenlayer aus. 
3. **Schritt 3:** Parameter für das erstellte Quartier können per Schieberegler angepasst werden.
4. **Schritt 4:** Wählen Sie ein Referenzgebiet für die Simulation der Zusammensetzung des Gebiets aus. 
5. **Schritt 5:** Klicken Sie auf "Anlegen". Das Neue Wohnbauquartier erscheint nun als hervorgehobenes Polygon mit Angaben zur Fläche und Einwohnerzahl auf der Karte.  

### Dienste
___
![Abbildung 13: Dienste](https://user-images.githubusercontent.com/43250699/142929329-caca93bf-aee3-4a5d-838e-cff33bca5502.png)
*Abbildung 13 - Dienste*

1. **Zeichnen/ Schreiben**
2. **Karte drucken**
   > Den aktuellen Kartenausschnitt inkl. aktiver Layer drucken.
3. **Mousehover ein-/ ausschalten**
   > Den Tooltip, der am Mauszeiger in der Karte eingeblendet wird (de-)aktivieren
4. **[Geodaten Importieren](#markdown-header-geodaten-importieren)**
5. **WMS hinzufügen**
   > Beliebige andere Kartendienste können aus dem FHH-Atlas oder anderen Quellen über die Webadresse (URL) des Dienstes eingebunden werden. Die URLs entnehmen Sie z.B. dem Metadatenkatalog der FHH oder dem Geoportal unter dem Info-Button im Themenbaum (s. Themenbaum).
6. **[Zweites Fenster öffnen](#markdown-header-zweites-fenster-öffnen)**
7. **[Sitzung speichen / laden](#markdown-header-sitzung-speichern)**
   > Die aktuelle Sitzung mit aktiven Daten, gewählten Gebieten und Filtern speichern. Sitzungen können im Browser gespeichert werden. Diese können beim Programmstart wieder aus dem Verlauf geladen werden.
   Wenn Browserverlauf oder Cache geleert werden, geht dieser Speicherstand verloren! Es kann immer nur eine Sitzung parallel vorgehalten werden.   
   Sitzungen als Datei auf dem Rechner speichern. Diese können jederzeit wieder geladen oder mit anderen CoSI Nutzer:innen geteilt werden.
8. **[Vorlagen](#markdown-header-vorlagen)**

   >*Hinweis: Manuell hinzugefügte Kartendienste (WMS) und erstellte Berechnungen bleiben nicht erhalten. Das Speichern aller Arbeitsergebnisse ist Teil des aktuell laufenden Weiterentwicklungsprojekts.*


### Geodaten Importieren
Mit diesem Werkzeug können Sie eigene Datensätze in Form von GeoJSONs hochladen und als Themenlayer einfügen, der anschließnend visualisiert werden kann und dem alle weiteren Analysefunktionen von CoSI zur Verfügung stehen.   

![Abbildung 14: Dateien importieren](https://user-images.githubusercontent.com/43250699/142930620-f556b3bb-a098-4deb-8394-2b5db6963c94.jpg)  
*Abbildung 14: Dateien importieren*   
1. **Info**
   > Über den Button finden Sie zu dieser Anleitung.
2. **Upload per Drag And Drop**
   > Ziehen Sie eine Datei per Drag and Drop in dieses Feld. Sie wird automatisch hochgeladen.
3. **Datei auswählen**
   > Mit einem Klick auf diesen Button öffen Sie den Dateibrowser Ihres Computers und können die hochzuladene Datei dort auswählen.
4. **Projektionssystem auswählen**
   > Geodaten sind in unterschiedlichen *Projektionssystemen* kodiert. Sollten Sie nach dem Upload feststellen, dass Ihre Daten an den falschen Orten visualisiert werden, überprüfen Sie bitte, in welchem Projektionssystem Ihre Datei kodiert ist und geben Sie es bei einem erneuten Upload in diesem Auswahlfeld an.  
  
Sobald Ihre Datei hier hochgeladen wurde, erscheint ein neues Fenster, in welchem Sie bestimmte Funktionen haben, um den Layer aus der Datei zu generieren.  

![Abbildung 15: Geodaten Importieren, Layeroptionen festlegen](https://user-images.githubusercontent.com/43250699/142931326-1effcb55-62a9-4fdb-918f-6d0fb9dccc49.jpg)  
*Abbildung 15: Geodaten Importieren, Layeroptionen festlegen* 

5. **Layername**
   > Hier können Sie den Layer frei benennen. Standardmäßig wird der Name der hochgeladenen Datei verwendet.
6. **[Styling](#markdown-header-styling)**
7. **[Einrichtungsdaten](#markdown-header-einrichtungsdaten)**
8. **[Filterdaten](#markdown-header-filterdaten)**
9. **[Numerische Werte](#markdown-header-numerische-werte)**
10. **Abbrechen/ Layer hinzufügen**
   > Mit einem Klick auf den Button "Abbrechen" brechen Sie den Vorgang ab und schließen das Fenster. Mit einem Klick auf "Layer Hinzufügen" wird der Import abgeschlossen und mit Ihren Einstellungen für die Funktionen in CoSI bereitgestellt.

#### Styling

![Abbildung 16: Geodaten Importieren, Layerstyling](https://user-images.githubusercontent.com/43250699/142931936-7da21540-9ac3-4a4d-85f5-1f78feae6978.jpg)  
*Abbildung 16: Geodaten Importieren, Layerstyling*  

- **6.1** Ein Icon auswählen, mit dem die jeweiligen Punkte visualisiert werden sollen. *(Diese Option steht nicht zur Verfügung, wenn es sich bei denen von Ihnen hochgeladenen Geodaten um Polygone handelt).
- **6.2** Mit dieser Checkbox legen Sie fest, ob alle Entitäten des Datensatzes mit derselben Farbe dargestellt werden sollen oder basierend auf einer ihrer Attribute farblich angepasst werden sollen. Aktivieren Sie diese Checkbox, bestimmen Sie das gewünschte Attribut bitte wie in 6.2.1 beschrieben.
   - **6.2.1** Haben Sie die Checkbox "Farbe nach Attributen" aktiviert, erscheint dieses Auswahlfeld, in dem alle Attribute der Einträge Ihres Datensatzes aufgelistet werden. Bestimmen Sie hier bitte das Attribut, anhand dessen die Farben generiert werden sollen.
   - **6.2.2** Sobald Sie in 6.2.1 ein Attribut ausgewählt haben, erscheint diese Checkbox, sofern es sich nicht um ein Attribut mit numerischen Werten handelt. Hier haben Sie die Option, Ihre Daten nicht auf Basis einer ausgewählten Farbe zu visualisieren, sondern gleichmäßig verteilt über ein Regenbogenfarbspektrum. Dies kann zur besseren Unterscheidung einzelner Punkte hilfreich sein. 
- **6.3** Haben Sie weder "Farbe nach Attributen" ausgewählt bzw. bei "Farbe nach Attributen" nicht die Checkbox "Regenbogenfarbspektrum" aktiviert, können Sie hier eine Farbe bestimmen, auf deren Basis die Daten visualisiert werden. Ein Klick auf das farbige Viereck der Textbox öffnet das Farbauswahlfeld.

#### Einrichtungsdaten
![Abbildung 17: Geodaten Importieren, Einrichtungsdaten](https://user-images.githubusercontent.com/43250699/142932334-7476d084-eda1-4a05-a93e-bf159ac55b8f.jpg)  
*Abbildung 17: Geodaten Importieren, Einrichtungsdaten*    

   - **7.1** Hier wählen Sie aus allen Attributen der Einträge Ihrer hochgeladenen Datei das Attribut aus, welches einen eindeutigen, individuellen Namen des Eintrags enthält. Dies ist für bestimmte Funktionen von CoSI relevant. Sollte ein solches Attribut nicht existieren, lassen Sie es bitte einfach frei.
   - **7.2** Hier wählen Sie aus allen Attributen der Einträge Ihrer hochgeladenen Datei ein Attribut aus, was den Typ des jeweiligen Eintrags am besten beschreibt. Handelt es sich bei Ihrem Datensatz beispielsweise um eine Reihe von unterschiedlichen Einrichtungen, könnte hier als Attribut eines gewählt werden, dass Werte wie "Kindergarten", "Krankenhaus" oder "Hotel" enthält.
   - **7.3** Für die korrekte Darstellung in manchen Werkzeugen von CoSI ist eine vollständige Adresse hilfreich. Sofern ein Attribut mit dem Namen "Adress" oder "address" vorhanden ist, wird Ihnen dieser Teil der Funktionen nicht angezeigt. Sollte ein solches Attribut aber nicht existieren, können Sie aus bestimmten im Vorfeld automatisch erkannten Attributen wie "Straße" oder "plz" wählen. Sie können mehrere dieser Felder auswählen und so die Adresse entsprechend zusammenstellen.
   - **7.4** Sollte keines der automatisch erkannten Attribute die korrekten Adressdaten enthalten, können Sie mit dem Button "Aus allen Objekteigenschaften wählen" alle Attribute anzeigen lassen, um daraus die Adresseigenschaften auszuwählen. Sollten in dem Datensatz keine entsprechenden Informationen hinterlegt sein, können Sie dieses Auswahlfeld ignorieren.

#### Filterdaten
![Abbildung 18: Geodaten Importieren, Filterdaten festlegen](https://user-images.githubusercontent.com/43250699/142932614-055ed92b-6967-436b-ace5-8977111ef473.jpg)  
*Abbildung 18: Geodaten Importieren, Filterdaten festlegen*  

   - Unter CoSIs Werkzeugen finden Sie auch das Filterwerkzeug, mit denen Sie alle Datensätze nach bestimmten Kriterien filtern können. Bitte bestimmen Sie hier, welche der Attribute Ihrer Daten für den Filter verfügbar gemacht werden sollen.
   - **8.1** Mit einem Klick auf diesen Button öffnet sich ein Auswahlfeld, mit Hilfe dessen Sie ein Attribut zur weißen Liste des Filters hinzufügen können.

#### Numerische Werte
![Abbildung 19: Geodarten Importieren, Numerische Werte festlegen](https://user-images.githubusercontent.com/43250699/142932809-d77c6760-bff3-4576-b9fa-1bcca88ef816.jpg)  
*Abbildung 19: Geodarten Importieren, Numerische Werte festlegen*  
- Mit Hilfe des Werkzeugs [Versorgungsanalyse](#markdown-header-versorgungsanalyse) können Sie unterschiedlichste Zahlwerte gegeneinander verrechnen. In diesem Bereich bestimmen Sie Attribute, die numerische Werte enthalten, die für die Versorgungsanalyse bereitgestellt werden sollen. Dies können alle sinnvoll quantitativ messbaren Werte sein, wie beispielswiese "Budget", "Einwohnerzahl", "Fläche" oder "Besuche pro Woche" etc.  

   - **9.1** Für die bessere Visualisierung in einer späteren Tabelle, können Sie hier dem numerischen Wert einen sinnvollen Namen geben, sollte das Attribut nicht sinnvoll benannt sein. So könnten Sie beispielsweise "budget_21" in "Verfügbare Mittel 2021" umbenennen.
   - **9.2** Hier sehen Sie die ID des Attributs und dahinter in Klammern einen Beispielwert aus dem ersten Eintrag.
   - **9.3** Mit dieser Checkbox fügen Sie das Attribut zu den numerischen Werten hinzu. 

### Zweites Fenster
Über den Reiter "Zweites Fenster öffnen" können Sie einen zweiten Browser-Tab mit dem Dashboard öffnen. Ihnen stehen dort alle Funktionen wie im ursprünglichen Fenster zur Verfügung. Sie können das zweite Fenster von Ihrem Browser durch Ziehen des Tabs (der Registerkarte) ablösen, um es auf einen zweiten Bildschirm zu bewegen. Wenn der InfoScreen (zweites Fenster) geöffnet ist, können Sie das Dashboard im Hauptfenster nicht mehr öffnen. Schließen Sie das Fenster, kehrt das Dashboard ins Hauptfenster zurück.


### Dashboard
____
![Abbildung 20: Dienste](../cosi/utils/assets/screenshots/dashboardmenu.png)

*Abbildung 20 - Dashboard*

1. **[Statistische Datenübersicht](#markdown-header-statistischedatenübersicht)**
2. **[Einrichtungsübersicht](#markdown-header-einrichtungsübersicht)**

*Die Anleitung für dieses Werkzeug befindet sich derzeit in Überarbeitung.*

### Statistische Datenübersicht
![Abbildung 21: Statistische Datenübersicht](../cosi/utils/assets/screenshots/statdashboard.png)
*Abbildung 21 - Statistische Datenübersicht*

### Einrichtungsübersicht

### Gebietsauswahl
___
Beim Starten von CoSI wird zunächst ein Bezugsrahmen festgelegt sowie ein Planungsgebiet zusammengestellt und bestätigt.

![Abbildung 22: Gebietsauswahl](https://user-images.githubusercontent.com/43250699/142933538-fd2e1dbc-8bef-444a-bc7f-66d0066a457e.png)

*Abbildung 22: Das Werkzeug "Gebiet auswählen"*  

1. **Bezugsrahmen wählen**
   > Über ein Dropdown Menü können **"Hamburg"**, **"Bezirke"**, **"Stadtteile"** oder **"Statistische Gebiete"** ausgewählt werden – dies legt die Verwaltungseinheit fest, für die die statistischen Daten angezeigt und Auswertungen erstellt werden sollen. Alle Funktionen sind auf den jeweiligen Gebietsebenen verfügbar. Die Zahl der verfügbaren Indikatoren kann jedoch variieren. Der Bezugsrahmen bestimmt auch die zu ladenden übergeordneten Referenzgebiete: Stadtteile für stat. Gebiete, Bezirke für Stadtteile.
2. **2.	Gebiete aus- und abwählen**
    - Die einzelnen Verwaltungseinheiten (statistisches Gebiet oder Stadtteil) anklicken (nochmaliges Klicken deaktiviert die Auswahl wieder), die Grenzen werden blau markiert. 
    - Auf dem Stift rechts neben "Auswahl zurücksetzen" klicken. Es wird ein Zeichentool aktiviert; damit kann der Nutzende ein Rechteck über das Auswahlgebiet ziehen um dieses auszuwählen.
    - Beide vorher beschriebenen Möglichkeiten sind auch miteinander kombinierbar, wobei die Reihenfolge unerheblich ist. Die Nutzenden können also zuerst einzelne Verwaltungseinheiten auswählen und dann das Zeichentool aktivieren, um damit weitere Verwaltungseinheiten dazu zuschalten oder auch andersherum vorgehen.
3. **Puffer festlegen**
   > Es kann ein Pufferradius in Metern festgelegt werden. Für den werden ausgewählte Fachdaten um das Planungsgebiet herum angezeig. Dies berücksichtigt die Tatsache, dass das Einzugsgebiet von einer Einrichtung nicht unbedingt übereinstimmt mit den Gebietsgrenzen der Verwaltungseinheit innerhalb derer sich die Einrichtung befindet. Die Analysefunktionen werden davon nicht beeinflusst.
4. **Auswahl bestätigen**
   > Lädt die Daten für das ausgewählte Planungsgebiet vom Server und legt den Bereich für die anzuzeigenden Fachdaten fest. Auch eine leere Auswahl kann bestätigt werden. Dann werden keine Daten geladen und Fachdaten für den gesamten Stadtbereich angezeigt. (s. unten)
5. **Auswahl zurücksetzen**
   > Setzt das aktuelle Planungsgebiet zurück. Im direkten Anschluss kann ein neues Planungsgebiet zusammengestellt und bestätigt werden.
6. **Auswahlrechteck zeichnen**
   > Ein Startpunkt wird gesetzt und ein Rechteck bis zum Endpunkt über das relevante Gebiet gezogen. Alle Verwaltungseinheiten, die innerhalb des Rechtecks oder an den Linien des Rechtecks liegen, werden in das Planungsgebiet aufgenommen.
7. **Zusätzliche Hilfsebenen ein/- ausblenden**
   > Mithilfe der Checkbox können zusätzliche Layer zur Orientierung ein- und ausgeblendet werden. Der Layer kann ebenfalls über den Themenbaum ein- und ausgeschaltet werden. Zu den Hilfsebenen gehören aktuell die "Sozialräume" und die "RISE Fördergebiete".

Das festgelegte Planungsgebiet kann jederzeit angepasst werden:  

   - Das Gebiet kann *erweitert* werden: sowohl per Klick als auch per Zeichentool.
   - Das Gebiet kann *verkleinert* werden: per Klick können markierte Verwaltungseinheiten wieder abgewählt werden.
   - Das Gebiet kann komplett zurückgesetzt werden: per Klick auf "Auswahl zurücksetzen".

Es muss nicht in jedem Nutzungskontext immer ein Planungsgebiet als erstes festgelegt werden; bestimmte Analysetools wie z.B. die [Erreichbarkeitsanalyse](#markdown-header-erreichbarkeitsanalyse) und [Vergleichbare Gebiete](#markdown-header-vergleichbare-gebiete) können verwendet werden ohne dass vorher ein Gebiet festgelegt wird.  

Für solche Fälle gelten folgende Hinweise:  

   - Es werden keine Datensätze geladen, d.h. eine Anzeige der regionalstatistischen Daten ist nicht möglich. Auch werden keine regionalstatistischen Daten im Dashboard angezeigt.
   - Beim Zuschalten von Themen aus den Fachdaten könnte der Ladevorgang länger dauern.
   - Möglicherweise funktioniert die [Erreichbarkeitsanalyse](#markdown-header-erreichbarkeitsanalyse) für eine sehr große Zahl von Einrichtungen nicht zuverlässig.

### Kartenanalyse regionalstatistischer Daten
___
Grundlage aller CoSI-Analysefunktionen sind neben den Fachdaten-Layern die Datensätze der StaNord-Datenbank, welche für die verschiedenen Verwaltungseinheiten als Zeitreihen vorliegen (s. [Regionalstatistische Daten](#markdown-header-regionalstatistische-daten)). Diese können für das ausgewählte Planungsgebiet direkt und dynamisch in der Karte visualisiert werden. Die *Farbskalierung und Legende* werden hierbei *dynamisch* aus der Auswahl generiert. Es wird immer der *aktuellste Datensatz* dargestellt.
Das Werkzeug zur Visualisierung regionalstatistischer Daten ermöglicht die Auswahl von regionalstatistischen Datensätzen, die für die ausgewählten Bezirke verfügbar sind. Es kann nur verwendet werden, wenn bereits Gebiete über das Gebietsauswahlwerkzeug ausgewählt wurden.
Das Werkzeug kann die ausgewählten Datensätze auf der Karte visualisieren und generiert eine dynamische Legende. Des Weiteren können Datensätze für mehrere Jahre ausgewählt und auf Wunsch in hintereinander laufender Folge animiert werden.  


![Abbildung 23: Fenster zur Kartenanalyse statistischer Daten](https://user-images.githubusercontent.com/43250699/142934510-c2a59330-4630-4ff3-9e3d-eb5305fc91f2.png)  

*Abbildung 23: Fenster zur Kartenanalyse statistischer Daten*  

1.	**Werkzeug minimieren/ maximieren**  
   > Über den Button kann das Fenster des Werkzeugs minimiert bzw. wieder maximiert werden.
2.	**Daten auf Karte visualisieren**  
   > Über den Button kann die Kartenvisualisierung der regionalstatistischen Daten ein- und wieder ausgeblendet werden.
3.	**Vor/ Zurück**  
   > Mit den Vor- und Zurückbuttons können die regionalstatistischen Datensätze fließend durchgeschaltet werden.
4.	**Jahresauswahl**  
   > Hier können Sie das Jahr auswählen, für den der regionalstatistische Datensatz visualisiert wird. Standardmäßig ist das aktuellste, verfügbare Jahr ausgewählt.
5.	**Referenzjahr auswählen**  
   > Hier können Sie ein Vergleichsjahr auswählen. Die prozentuale Differenz zum ersten, ausgewählten Jahr wird dann ebenfalls auf der Karte eingeblendet.
6.	**Auswahlfeld für die verfügbaren regionalstatistischen Datensätze**     
   > Erlaubt es, die relevanten regionalstatistischen Datensätze für die ausgewählten Gebiete und den Bezugsmaßstab durchzuschalten und diese mit Farbskala auf der Karte darzustellen. Die Auswahl zeigt immer die neuesten verfügbaren Daten.
7.	**Legende**  
   > Die Legende für die farbliche Visualisierung der Karte. Wenn Sie mit der Maus über einen der Marker hovern, wird der Wert des zugehörigen, ausgewählten Gebiets angezeigt. Rechts und links werden der niedrigste und der höchste Wert noch einmal zusätzlich dargestellt.
8.	**Info**  
   > Über den Button öffnen Sie diese Anleitung.
9.	**Playbutton**  
   > Mit dem Play-Button starten Sie die Animation der Datensätze über alle verfügbaren Jahre. In dem danebenstehenden Feld können Sie einen Wert eintragen, der angibt, wie schnell die einzelnen Animationsschritte durchlaufen werden (in Sekunden).
10. **Daten als Chart visualisieren**  
   > Lädt die verfügbaren regionalstatistischen Daten der ausgewählten Gebiete in das Visualisierungs-Werkzeug und erzeugt dort einen Graphen.
11. **Gebietsnamen ein-/ ausblenden**  
   > Über den Button können Sie die Namen der ausgewählten Gebiete auf der Karte ein- und wieder ausblenden.
12. **Hilfsbutton**  

### Chartgenerator
___
Das Werkzeug "Chartgenerator" erstellt Graphen aus Datensätzen und verwaltet diese. Darüberhinaus ermöglicht es Ihnen den Export dieser Graphen als PNG.

![Abbildung 20: Chartgenerator](https://user-images.githubusercontent.com/43250699/143032270-d9521038-a4b8-4669-bcd8-452a701fc962.jpg)  
*Abbildung 20: Chartgenerator*

1. **Info**
   > Über diesen Button öffnen Sie diese Anleitung.
2. **Liniendiagramm**
   > Standardgemäß werden für jeden Datensatz bis zu drei Graphen erzeugt, nämlich ein Liniendiagramm, ein Balkendiagramm und mehrere Tortendiagramme. Mit diesem Button wechseln Sie zur Ansicht des Liniendiagramms.
3. **Balkendiagramm**
   > Mit diesem Button wechseln Sie zur Ansicht des Balkendiagramms.
4. **Tortendiagramme**
   > Mit diesem Button wechseln Sie zur Ansicht der Tortendiagramme.
5. **Graphen löschen**
   > Mit diesem Button löschen Sie alle Graphen des aktuell aktiven Datensatzes. (s. 6.).
6. **Graph**
   > Der erzeugte Graph. Sie finden hier den Titel des ausgewählten Datensatzes, die Legende und den erzeugten Graphen.
7. **Y-Achse auf 0**
   > Hier wählen Sie aus, ob die Y-Achse des Graphen von 0 an beginnt oder relativ zum kleinsten verfügbaren Wert.  
   *Diese Funktion ist nur beim Liniendiagramm verfügbar.*
8. **Export als PNG**
9. **Navigation**
   > Mit diesen Buttons schalten Sie zwischen allen in dieser Session erzeugten Graphen hin- und her.
10. **Export aller Graphen als PNG**
   > Für alle erzeugten Graphen wird die Aktion 9. durchgeführt. Sie werden mehrere PNG-Dateien herunterladen. Eventuell wird Ihr Browser Sie dazu auffordern, dem Download mehrerer Dateien noch einmal gesondert zu zustimmen.
11. **Alle Graphen löschen**
   > Löscht alle in dieser Session erzeugten Graphen und setzt den Chartgenerator zurück.
