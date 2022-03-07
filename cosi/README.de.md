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
    - [DIPAS](#dipas)
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
    - [Sitzung Speichern/Laden](#sitzung-speichernladen)
    - [Vorlagen](#vorlagen)
    - [Dashboard](#dashboard)
    - [Statistische Datenübersicht](#statistische-datenübersicht)
      - [Burgermenü](#burgermenü)
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
      1. [Statistische Datenübersicht](#markdown-header-statistische-datenübersicht)
      2. [Einrichtungsübersicht](#markdown-header-einrichtungsübersicht)
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
  


![Abbildung 5: Erreichbarkeit ab einem Referenzpunkt](https://user-images.githubusercontent.com/43250699/157067677-5f5db4a7-498a-45b2-8c06-6f2ea5ed6cbf.png)

*Abbildung 5: Erreichbarkeit ab einem Referenzpunkt*
  
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

![Abbildung 6: Erreichbarkeit ausgewÃ¤hlter Einrichtungen im Gebiet](https://user-images.githubusercontent.com/43250699/157067851-a2c165c4-894c-4b3f-80a9-4bc626516771.png)

*Abbildung 6: Erreichbarkeit ausgewählter Einrichtungen im Gebiet*

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
  


### Vergleichbare Gebiete ermitteln
Das Werkzeug erlaubt die Ermittlung aller Gebiete (Stadtteile oder statistische Gebiete), in denen die ausgewählten Parameter vorherrschen, bzw. solcher, die dem gewählten Referenzgebiet in diesen Parametern ähneln.
Wählen sie unter Filter die gewünschten Parameter für den Vergleich, sowie ein Referenzgebiet (optional).  

![Abbildung 7: Vergleichbare Gebiete ermitteln](https://user-images.githubusercontent.com/43250699/157012950-d631691b-0f40-4ab5-85f4-9e6b9c250d7e.png)   
 
*Abbildung 7: Vergleichbare Gebiete ermitteln*  

1. **Statistische Datenfilter**
   > Gewünschten Parameter für den Vergleich auswählen. Es können beliebig viele Parameter hinzugefügt werden. Alle StaNord-Datensätze sind hierfür verfügbar. Anteilige Werte eignen sich jedoch besser für die Vergleichbarkeit. Gegenwärtig können eigene Berechnungen aus dem Dashboard nicht herangezogen werden.
2. **Referenzgebiet**
   > Optional kann eins der ausgewählten Gebiete als Referenzgebiet angegeben werden.
3. **Filter hinzufügen**
   > Die Parametereinstellungen zeigen den aktuellen Datensatz (Jahr Min.- und Max.-Wert aller Hamburger Gebiete, den Referenzwert (frei wählbar oder des Referenzgebiets) sowie die Toleranz nach oben und unten. Das Toleranzintervall ist entweder in absoluten Zahlen oder in Prozent für anteilige Werte angegeben.
4. **Alle Filter zurücksetzen** 
   > Setzen Sie Ihre Eingaben zurück.  
5. **Pagination** 
   > Der "Datensatz hinzufügen" Button aus der [Pagination](./pagination.md).  

![Abbildung 8: Vergleichbare Gebiete ermitteln, Ergebnisse](https://user-images.githubusercontent.com/43250699/157013004-f8b83b5e-92b3-4900-a0c0-60a1518a187f.png)  
*Abbildung 8: Vergleichbare Gebiete ermitteln, Ergebnisse*  

1. **Pagination**
   > Die [Pagination](./pagination.md) verwaltet die unterschiedlichen Datensätze. Sie erscheint, sobald Sie einen zweiten Datensatz erstellt haben.
2. **Parametereinstellungen (Jahr)**
   > Wählen Sie die Grundlage für das entsprechende Jahr aus.  
3. **Parametereinstellungen (Attribute)**
   > Sofern es sich um einen Themenlayer handelt, können Sie hier ggf. Attribute der Einrichtung auswählen, anhand deren Sie nach vergleichbaren Gebieten suchen.  
4. **Parametereinstellungen (Toleranz)**
   > Stellen Sie die Toleranz ein, innerhalb derer weitere vergleichbare Gebiete gefunden werden sollen. Das Toleranzintervall ist entweder in absoluten Zahlen oder in Prozent für anteilige Werte angegeben.  
5. **Ergebnisse**
   > Eine Liste aller Gebiete, auf die die gewählten Kriterien zutreffen, wird im Fenster angezeigt. Ein Klick auf ein Gebiet legt den Kartenausschnitt auf dieses fest.
6. **Als Gebietsauswahl setzen**
   > Über *Ergebnis als Gebietsauswahl* setzen kann die aktuelle Gebietsauswahl für weitere Analysen auf die Ergebnis-Gebiete gesetzt werden.
  
  
![Abbildung 2: Versorgungsanalyse, Ergebnisse](https://user-images.githubusercontent.com/43250699/157009202-4cfeb5ff-e519-4305-ba4f-4ecde4f60bd0.png)

*Abbildung 2: Versorgungsanalyse, Ergebnisse*

1. **Pagination**
   > Die [Pagination](./pagination.md) verwaltet alle von Ihnen erstellen Datensätze und bietet bestimmte standardisierte Funktionen wie Downloads und ähnliches an. Sie finden mehr Informationen dazu [hier](./pagination.md).
2. **Daten als Chart visualisieren**
   > Die Daten werden zum [Chartgenerator](./chartgenerator.md) geladen und dort als Graphen visualisiert.
3. **Auf der Karte visualisieren**  
   > Die Daten werden mit Hilfe der [Kartenvisualisierung](./kartenvisualisierung.md) auf der Karte visualisiert und je nach Wert in unterschiedlichen Farben dargestellt.
4. **Tabellenspalte für erweiterte Funktionen auswählen**
   > Hier können Sie Tabellenspalte auswählen die für die erweiterten Funktionen "Als Chart visualisieren" (3) und "Auf der Karte visualisieren" (4) herangezogen werden soll.
   
5. **Jahr auswählen**
   > Hier können Sie das Jahr auswählen, für das die entsprechenden Daten geladen worden sind.
6. **Ergebnistabelle**  
      - **Gebiet:** Die ausgewählten Gebiete, für die die Ergebnisse berechnet wurden. Hier finden sich auch die Indikatoren für die Zeilen "Gesamt" und "Durchschnitt".
      - **Auswahlfeld (1):**  
         Der Wert für den in Auswahlfeld (1) gewählten Datensatz.
      - **Auswahlfeld (2):**  
         Der Wert für den in Auswahlfeld (2) gewählten Datensatz.
      **Verhältnis:**  
         Hier wurde der Wert des Auswahlfeldes (1) durch den Wert des Auswahlfeldes (2) geteilt.
      - **Bedarfsdeckung:**  
         Die Versorgungsabdeckung in Prozent, d.h. das Verhältnis zwischen der aus Auswahlfeld (1) ermittelten Kapazität und Auswahlfeld (2) im Gebiet. Wurde kein Faktor F ausgewählt, zeigt die Spalte das direkte Verhältnis beider Felder in Prozent an.
      - **6.1 Pagination der Ergebnistabelle**
      
         Wenn in Ihrer Ergebnistabelle mehr als 10 Ergebnisse angezeigt werden, können Sie hier entsprechend die Daten durchschalten.
V
### Filter
Die aktiven, ausgewählten Themen können durch Klick auf den Reiter "Filter" nach den Kategorien ihrer Datensätze durchsucht und gefiltert werden. Die Karte zoomt automatisch auf die Filterergebnisse. Es werden nur Ergebnisse in den ausgewählten Gebieten einbezogen. Der Filter ist für alle Fachdatensätze verfügbar, welche sinnvolle filterbare Attribute (wie Fläche, Nutzung, Träger, etc.) aufweisen.  

![Abbildung 9: Filter](https://user-images.githubusercontent.com/43250699/142924026-a46ada10-7289-4882-9b2e-c41528289930.jpg)

*Abbildung 9: Filter*  

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


![Abbildung 10: Versorgungsanalyse, Einstellungen](https://user-images.githubusercontent.com/43250699/142926985-dfc8c2f9-c652-49f5-8f92-64a985a64f5e.jpg)

*Abbildung 10: Versorgungsanalyse, Einstellungen*

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

![Abbildung 11: Versorgungsanalyse, Ergebnisse](https://user-images.githubusercontent.com/43250699/157009202-4cfeb5ff-e519-4305-ba4f-4ecde4f60bd0.png)

*Abbildung 11: Versorgungsanalyse, Ergebnisse*

1. **Pagination**
   > Die [Pagination](./pagination.md) verwaltet alle von Ihnen erstellen Datensätze und bietet bestimmte standardisierte Funktionen wie Downloads und ähnliches an. Sie finden mehr Informationen dazu [hier](./pagination.md).
2. **Daten als Chart visualisieren**
   > Die Daten werden zum [Chartgenerator](./chartgenerator.md) geladen und dort als Graphen visualisiert.
3. **Auf der Karte visualisieren**  
   > Die Daten werden mit Hilfe der [Kartenvisualisierung](./kartenvisualisierung.md) auf der Karte visualisiert und je nach Wert in unterschiedlichen Farben dargestellt.
4. **Tabellenspalte für erweiterte Funktionen auswählen**
   > Hier können Sie Tabellenspalte auswählen die für die erweiterten Funktionen "Als Chart visualisieren" (3) und "Auf der Karte visualisieren" (4) herangezogen werden soll.
   
5. **Jahr auswählen**
   > Hier können Sie das Jahr auswählen, für das die entsprechenden Daten geladen worden sind.
6. **Ergebnistabelle**  
      - **Gebiet:** Die ausgewählten Gebiete, für die die Ergebnisse berechnet wurden. Hier finden sich auch die Indikatoren für die Zeilen "Gesamt" und "Durchschnitt".
      - **Auswahlfeld (1):**  
         Der Wert für den in Auswahlfeld (1) gewählten Datensatz.
      - **Auswahlfeld (2):**  
         Der Wert für den in Auswahlfeld (2) gewählten Datensatz.
      **Verhältnis:**  
         Hier wurde der Wert des Auswahlfeldes (1) durch den Wert des Auswahlfeldes (2) geteilt.
      - **Bedarfsdeckung:**  
         Die Versorgungsabdeckung in Prozent, d.h. das Verhältnis zwischen der aus Auswahlfeld (1) ermittelten Kapazität und Auswahlfeld (2) im Gebiet. Wurde kein Faktor F ausgewählt, zeigt die Spalte das direkte Verhältnis beider Felder in Prozent an.
      - **6.1 Pagination der Ergebnistabelle**
      
         Wenn in Ihrer Ergebnistabelle mehr als 10 Ergebnisse angezeigt werden, können Sie hier entsprechend die Daten durchschalten.


### DIPAS
Mit dem DIPAS Werkzeug können alle Beiträge aus laufenden DIPAS Verfahren in der Karte visualisiert, nach verschiedenen Kriterien dargestellt und für alle CoSI-Werkzeuge verfügbar gemacht werden. D.h. alle Beiträge können in der [Einrichtungsübersicht](#markdown-header-einrichtungsübersicht) angezeigt, für [Versorgungsanalyse](#markdown-header-versorgungsanalyse), [Erreichbarkeitsanalyse](#markdown-header-erreichbarkeitsanalyse) und [Vergleichbare Gebiete Ermitteln](#markdown-header-vergleichbare-gebiete-ermitteln) verwendet und mit dem [Filter](#markdown-header-filter) gefiltert werden.


![Abbildung 12: DIPAS](../cosi/utils/assets/screenshots/dipas.PNG)

*Abbildung 12: DIPAS*

1. **Beteiligungsverfahren auswählen**
   > Für jedes Verfahren aus der DIPAS-Datenbank wird automatisch eine Registerkarte angelegt, welche durchs Anklicken aufgeklappt werden kann. Ein aufgeklapptes Verfahren zeigt dessen Beschreibungstext und die Kontrollfelder für die Visualisierung. Jedem Verfahren wid dabei eine zufällige Farbe zugewiesen.
2. **Verfahren in der Karte anzeigen**
   > Zeigt das Verfahrensgebiet als Polygon in der Karte in der jeweiligen Farbe des Verfahrens.
3. **Einzelne Beiträge in der Karte anzeigen**
   > Zeigt alle Einzelbeiträge des Verfahrens in der Karte. Das Styling der Beiträge kann unten (s. 5.) festgelegt werden.
4. **Heatmap in der Karte anzeigen** 
   > Zeigt eine Heatmap der Beiträge in der Karte. Das Gewicht eines Punktes richtet sich dabei nach der Gesamtzahl der Bewertungen des Beitrags, also der Stärke der Resonanz auf ihn.
5. **Styling der Beiträge wählen**
   > - nach Projekt: Alle Beiträge werden gleichmäßig in der Projektfarbe dargestellt.
   > - nach Kategorien im Projektfarbraum: Jede Kategorie wird in einer Schattierung der Projektfarbe dargestellt.
   > - nach Kategorien im Regenbogenspektrum: Jeder Kategorie wird eine zufällig Farbe zugewiesen.
   > - nach Bewertung: Die Beiträge werden abhängig von den positiven- und negativen-Bewertungen dargestellt. Die Größe des Punktes richtet sich dabei nach der Gesamtzahl der Reaktionen, die Farbe nach dem Verhältnis von positiven (grün) und negativen (rot) Bewertungen.
6. **Beiträge in der Karte**
   > Alle Beiträge werden mit ihrer ID (einer fortlaufenden Nummer) in der Karte dargestellt.


### Simulation
___
Das Modul Simulation bietet die Möglichkeit, fiktionale Einrichtungen oder Wohnungsbauquartiere hinzuzufügen und Analysen auf einer hypothetischen Grundlage durchzuführen.  
  
![Abbildung 13: Simulation](https://user-images.githubusercontent.com/43250699/142929647-1f8dd57a-fd18-4398-a0ca-19d8d110e0c0.jpg)

*Abbildung 13: Simulation*  

1. **[Einrichtungen anlegen](#markdown-header-einrichtungen-anlegen)**
   > Hier können Sie verschiedene Themen auswählen und je nach Thema neue Einrichtungen erstellen, kopieren und verschieben. Dieses bietet die Grundlage, um in verschiedenen Szenarien Analysen durchzuführen. 
2. **[Wohnungsbauquartiere anlegen](#markdown-header-wohnungsbauquartiere-anlegen)**
   > In dieser Komponente ist es möglich, fiktionale oder zukünftige Wohnungsbauquartiere zu erstellen. Die dadurch erzeugten Parameter werden in weitere Analysen mit eingebunden. 

### Einrichtungen anlegen

Sobald sie "Einrichtungen anlegen" auswählen, öffnet sich ein Fenster, in dessen oberem Bereich Sie den Szenario Manager finden. Bei der Funktion "Wohnungsbauquartiere anlegen" befindet sich der Szenario Manager an derselben Stelle.

#### Szenario Manager
![Abbildung 14: Szenario Manager](https://user-images.githubusercontent.com/43250699/143022435-622e8032-e0da-4b5e-bd0c-9e33aa07de2c.png)  

*Abbildung 14: Szenario Manager* 

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
![Abbildung 17: Dienste](https://user-images.githubusercontent.com/43250699/142929329-caca93bf-aee3-4a5d-838e-cff33bca5502.png)

*Abbildung 17 - Dienste*

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

![Abbildung 18: Dateien importieren](https://user-images.githubusercontent.com/43250699/142930620-f556b3bb-a098-4deb-8394-2b5db6963c94.jpg)  
*Abbildung 18: Dateien importieren*   
1. **Info**
   > Über den Button finden Sie zu dieser Anleitung.
2. **Upload per Drag And Drop**
   > Ziehen Sie eine Datei per Drag and Drop in dieses Feld. Sie wird automatisch hochgeladen.
3. **Datei auswählen**
   > Mit einem Klick auf diesen Button öffen Sie den Dateibrowser Ihres Computers und können die hochzuladene Datei dort auswählen.
4. **Projektionssystem auswählen**
   > Geodaten sind in unterschiedlichen *Projektionssystemen* kodiert. Sollten Sie nach dem Upload feststellen, dass Ihre Daten an den falschen Orten visualisiert werden, überprüfen Sie bitte, in welchem Projektionssystem Ihre Datei kodiert ist und geben Sie es bei einem erneuten Upload in diesem Auswahlfeld an.  
  
Sobald Ihre Datei hier hochgeladen wurde, erscheint ein neues Fenster, in welchem Sie bestimmte Funktionen haben, um den Layer aus der Datei zu generieren.  

![Abbildung 19: Geodaten Importieren, Layeroptionen festlegen](https://user-images.githubusercontent.com/43250699/142931326-1effcb55-62a9-4fdb-918f-6d0fb9dccc49.jpg)  
*Abbildung 19: Geodaten Importieren, Layeroptionen festlegen* 

5. **Layername**
   > Hier können Sie den Layer frei benennen. Standardmäßig wird der Name der hochgeladenen Datei verwendet.
6. **[Styling](#markdown-header-styling)**
7. **[Einrichtungsdaten](#markdown-header-einrichtungsdaten)**
8. **[Filterdaten](#markdown-header-filterdaten)**
9. **[Numerische Werte](#markdown-header-numerische-werte)**
10. **Abbrechen/ Layer hinzufügen**
   > Mit einem Klick auf den Button "Abbrechen" brechen Sie den Vorgang ab und schließen das Fenster. Mit einem Klick auf "Layer Hinzufügen" wird der Import abgeschlossen und mit Ihren Einstellungen für die Funktionen in CoSI bereitgestellt.

#### Styling

![Abbildung 20: Geodaten Importieren, Layerstyling](https://user-images.githubusercontent.com/43250699/142931936-7da21540-9ac3-4a4d-85f5-1f78feae6978.jpg)  
*Abbildung 20: Geodaten Importieren, Layerstyling*  

- **6.1** Ein Icon auswählen, mit dem die jeweiligen Punkte visualisiert werden sollen. *(Diese Option steht nicht zur Verfügung, wenn es sich bei denen von Ihnen hochgeladenen Geodaten um Polygone handelt).
- **6.2** Mit dieser Checkbox legen Sie fest, ob alle Entitäten des Datensatzes mit derselben Farbe dargestellt werden sollen oder basierend auf einer ihrer Attribute farblich angepasst werden sollen. Aktivieren Sie diese Checkbox, bestimmen Sie das gewünschte Attribut bitte wie in 6.2.1 beschrieben.
   - **6.2.1** Haben Sie die Checkbox "Farbe nach Attributen" aktiviert, erscheint dieses Auswahlfeld, in dem alle Attribute der Einträge Ihres Datensatzes aufgelistet werden. Bestimmen Sie hier bitte das Attribut, anhand dessen die Farben generiert werden sollen.
   - **6.2.2** Sobald Sie in 6.2.1 ein Attribut ausgewählt haben, erscheint diese Checkbox, sofern es sich nicht um ein Attribut mit numerischen Werten handelt. Hier haben Sie die Option, Ihre Daten nicht auf Basis einer ausgewählten Farbe zu visualisieren, sondern gleichmäßig verteilt über ein Regenbogenfarbspektrum. Dies kann zur besseren Unterscheidung einzelner Punkte hilfreich sein. 
- **6.3** Haben Sie weder "Farbe nach Attributen" ausgewählt bzw. bei "Farbe nach Attributen" nicht die Checkbox "Regenbogenfarbspektrum" aktiviert, können Sie hier eine Farbe bestimmen, auf deren Basis die Daten visualisiert werden. Ein Klick auf das farbige Viereck der Textbox öffnet das Farbauswahlfeld.

#### Einrichtungsdaten
![Abbildung 21: Geodaten Importieren, Einrichtungsdaten](https://user-images.githubusercontent.com/43250699/142932334-7476d084-eda1-4a05-a93e-bf159ac55b8f.jpg)  
*Abbildung 21: Geodaten Importieren, Einrichtungsdaten*    

   - **7.1** Hier wählen Sie aus allen Attributen der Einträge Ihrer hochgeladenen Datei das Attribut aus, welches einen eindeutigen, individuellen Namen des Eintrags enthält. Dies ist für bestimmte Funktionen von CoSI relevant. Sollte ein solches Attribut nicht existieren, lassen Sie es bitte einfach frei.
   - **7.2** Hier wählen Sie aus allen Attributen der Einträge Ihrer hochgeladenen Datei ein Attribut aus, was den Typ des jeweiligen Eintrags am besten beschreibt. Handelt es sich bei Ihrem Datensatz beispielsweise um eine Reihe von unterschiedlichen Einrichtungen, könnte hier als Attribut eines gewählt werden, dass Werte wie "Kindergarten", "Krankenhaus" oder "Hotel" enthält.
   - **7.3** Für die korrekte Darstellung in manchen Werkzeugen von CoSI ist eine vollständige Adresse hilfreich. Sofern ein Attribut mit dem Namen "Adress" oder "address" vorhanden ist, wird Ihnen dieser Teil der Funktionen nicht angezeigt. Sollte ein solches Attribut aber nicht existieren, können Sie aus bestimmten im Vorfeld automatisch erkannten Attributen wie "Straße" oder "plz" wählen. Sie können mehrere dieser Felder auswählen und so die Adresse entsprechend zusammenstellen.
   - **7.4** Sollte keines der automatisch erkannten Attribute die korrekten Adressdaten enthalten, können Sie mit dem Button "Aus allen Objekteigenschaften wählen" alle Attribute anzeigen lassen, um daraus die Adresseigenschaften auszuwählen. Sollten in dem Datensatz keine entsprechenden Informationen hinterlegt sein, können Sie dieses Auswahlfeld ignorieren.

#### Filterdaten
![Abbildung 22: Geodaten Importieren, Filterdaten festlegen](https://user-images.githubusercontent.com/43250699/142932614-055ed92b-6967-436b-ace5-8977111ef473.jpg)  
*Abbildung 22: Geodaten Importieren, Filterdaten festlegen*  

   - Unter CoSIs Werkzeugen finden Sie auch das Filterwerkzeug, mit denen Sie alle Datensätze nach bestimmten Kriterien filtern können. Bitte bestimmen Sie hier, welche der Attribute Ihrer Daten für den Filter verfügbar gemacht werden sollen.
   - **8.1** Mit einem Klick auf diesen Button öffnet sich ein Auswahlfeld, mit Hilfe dessen Sie ein Attribut zur weißen Liste des Filters hinzufügen können.

#### Numerische Werte
![Abbildung 23: Geodarten Importieren, Numerische Werte festlegen](https://user-images.githubusercontent.com/43250699/142932809-d77c6760-bff3-4576-b9fa-1bcca88ef816.jpg)  
*Abbildung 23: Geodarten Importieren, Numerische Werte festlegen*  
- Mit Hilfe des Werkzeugs [Versorgungsanalyse](#markdown-header-versorgungsanalyse) können Sie unterschiedlichste Zahlwerte gegeneinander verrechnen. In diesem Bereich bestimmen Sie Attribute, die numerische Werte enthalten, die für die Versorgungsanalyse bereitgestellt werden sollen. Dies können alle sinnvoll quantitativ messbaren Werte sein, wie beispielswiese "Budget", "Einwohnerzahl", "Fläche" oder "Besuche pro Woche" etc.  

   - **9.1** Für die bessere Visualisierung in einer späteren Tabelle, können Sie hier dem numerischen Wert einen sinnvollen Namen geben, sollte das Attribut nicht sinnvoll benannt sein. So könnten Sie beispielsweise "budget_21" in "Verfügbare Mittel 2021" umbenennen.
   - **9.2** Hier sehen Sie die ID des Attributs und dahinter in Klammern einen Beispielwert aus dem ersten Eintrag.
   - **9.3** Mit dieser Checkbox fügen Sie das Attribut zu den numerischen Werten hinzu. 

### Zweites Fenster
Über den Reiter "Zweites Fenster öffnen" können Sie einen zweiten Browser-Tab mit dem Dashboard öffnen. Ihnen stehen dort alle Funktionen wie im ursprünglichen Fenster zur Verfügung. Sie können das zweite Fenster von Ihrem Browser durch Ziehen des Tabs (der Registerkarte) ablösen, um es auf einen zweiten Bildschirm zu bewegen. Wenn der InfoScreen (zweites Fenster) geöffnet ist, können Sie das Dashboard im Hauptfenster nicht mehr öffnen. Schließen Sie das Fenster, kehrt das Dashboard ins Hauptfenster zurück.

### Sitzung Speichern/Laden 
*(Befindet sich in Entwicklung)*

![Abbildung 24: Sitzung Speichern](../cosi/utils/assets/screenshots/sitzungspeichern.png)
*Abbildung 24: Sitzung speichern / laden*

Mit dem Dienst **Sitzung speichern/laden** können aktuelle diverse Informationen der aktuellen Arbeitssitzung abgespeichert werden um diese zu einem späteren Zeitpunkt wieder öffnen und weiterbearbeiten zu können. Dies umfasst

- Die ausgewählte Verwaltungsebene und ausgewählte Gebiete
- Aktive Fachdatenthemen 
- Mit den [Simulationswerkzeugen](#markdown-header-simulation) erstellte Szenarien
- Ergebnisse und Konfigurationen der Werkzeuge [Erreichbarkeitsanalyse](#markdown-header-erreichbarkeitsanalyse) und [Versorgungsanalyse](#markdown-header-versorgungsanalyse)

1. **Schnell speichern**
   > Aktuelle Sitzung im Browser (z.B. Edge, Firefox) speichern. Diese können beim Start von CoSI über den Button **Letzte Laden** wieder geladen werden. Wenn Browserverlauf oder Cache geleert werden, geht dieser Speicherstand verloren! Es kann immer nur eine Sitzung vorgehalten werden.
2. **Letzte laden**
   > Letzte im Browser gespeicherte Sitzung aus dem Cache laden
3. **Letzte löschen**
   > Letzte Sitzung aus dem Cache löschen
4. **Speichern unter**
   > Eine Sitzung benennen und als Datei auf dem Rechner speichern und über den Button **Datei laden** wieder laden. Diese können jederzeit wieder geladen oder mit anderen CoSI Nutzer:innen geteilt werden. 
   
   *Expertentipp: Die Sitzungen können mit jedem Texteditor geöffnet und als JSON-Datei bearbeitet werden.*
5. **Datei laden**
   > Sitzung aus lokaler Datei öffnen
6. **Automatisches Speichern (10min)**
   > Wenn aktiv wird die aktuelle Sitzung im Modus **Schnell speichern** alle 10min im Hintergrund gespeichert und kann über **Letzte laden** wiederhergestellt werden.

### Vorlagen
![Abbildung 25: Vorlagen](../cosi/utils/assets/screenshots/vorlagen.png)

*Abbildung 25: Vorlagen*

Über den Dienst **Vorlagen** können Vorlagen zu verschieden Themenkomplexen und Arbeitsfeldern geladen werden. Diese können Fachdatenthemen, aktive Werkzeuge und eine Gebietsauswahl beinhalten. Die verfügbaren Vorlagen und ihr Inhalt werden von den Fachbehörden in Koordination mit dem CoSI-Betriebsteam gepflegt.

1. **Liste aller Vorlagen (zum Aufklappen)**
2. **Inhaltsübersicht einer Vorlage**
   > - Titel
   > - Stand (Datum)
   > - Beschreibung
   > - Fachdatenthemen
   > - Aktiver Bezugsrahmen (Verwaltungsebene)
   > - Ausgewählte Gebiete
3. **optionale Gebietsauswahl**
   > Wenn kein Bezugrahmen/Gebiete definiert sind, können diese händisch im Vorfeld oder nach dem Laden ausgewählt werden. Die Inhalte werden dann für die aktive Gebietsauswahl geladen.
3. **Vorlage laden**
   > Die ausgewählte Vorlage laden.

___
### Dashboard
____
![Abbildung 26: Dashboard](../cosi/utils/assets/screenshots/dashboardmenu.png)

*Abbildung 26: Dashboard*

In den Dashboards können komplementär tabellarisch Informationen zu den statistischen Daten der ausgewählten Gebiete ([Statistische Datenübersicht](#markdown-header-statistische-datenübersicht)) bzw. den Einrichtungen der aktiven Fachdaten-Themen ([Einrichtungsübersicht](#markdown-header-einrichtungsübersicht)) angezeigt, ausgewertet und von dort exportiert werden.

1. **[Statistische Datenübersicht](#markdown-header-statistische-datenübersicht)**
2. **[Einrichtungsübersicht](#markdown-header-einrichtungsübersicht)**

### Statistische Datenübersicht
![Abbildung 27: Statistische Datenübersicht](../cosi/utils/assets/screenshots/statdashboard.png)
*Abbildung 27: Statistische Datenübersicht*

1. **Gruppen ein-/ausklappen**
   > Thematische Gruppen (vgl. [Regionalstatistische Daten](#markdown-header-regionalstatistische-daten)) über das **+** ein- und ausklappen.
2. **Aktionen**
   > - s. [Burger-Menü](#markdown-header-burgermenü)
   > - Visualisierung ein- / ausschalten: Schaltet die Visualisierung des ausgewählten Indikators zum aktuell gewählten Jahr in der Karte ein/aus
   > - Jahre ein- / ausklappen: Klappt die Tabellenzeile auf um alle Jahre der Zeitreihe darzustellen.
3. **Jahr auswählen**
   > Aktuelles Jahr für die Darstellung in Tabelle und Karte auswählen.
4. **Spalte verschieben**
   > Mit den Pfeilen links/rechts die Spalte verschieben. Die Trennstriche grenzen die Verwaltungsebenen voneinander ab
5. **Spalte ein-/ausblenden**
   > Mit dem Auge kann eine Spalte aus- und eingeblendet werden, um die Tabelle übersichtlicher zu gestalten. Ausgeblendete Spalten werden für Exporte und Diagramme nicht berücksichtigt.
6. **Aggregationsspalten**
   > Die letzten zwei Spalten zeigen standardmäßig Durchschnitts- und Gesamtwert für die **ausgewählten Gebiete** (wie in der Karte dargestellt, nur die ausgewählte Verwaltungsebene). Für relative (anteilige) Indikatoren können keine Aggregationen berechnet werden, da der Bezugsrahmen nicht klar ist.
7. **Spalte auswählen**
   > Spalten für Export und Diagramm-Erstellung auswählen. Ist keine Spalte ausgewählt werden alle verwendet.
8. **Zeile auswählen**
   > Zeilen für Export und Diagramm-Erstellung auswählen. Ist keine Spalte ausgewählt werden alle für den Export bzw. nur die aktuelle für die Diagramme verwendet.
9. **Trendpfeil**
   > Der Trendpfeil zeigt das extrapolierte Wachstum für den nächsten Zeitschritt (in % im Tooltip) an. Für die Abschätzung werden die Steigungen der letzten 5 Zeitschritte, gewichtet nach Aktualität, herangezogen. Die Darstellung erhebt **keinen Anspruch** auf Genauigkeit und berücksichtigt keine anderen Werte über die aktuelle Zeitreihe hinaus.
10. **Themenfilter**
      > Über den Filter können beliebige Indikatoren (sortiert nach Gruppen) für die Darstellung und den Export ausgewählt werden. Die Liste kann im Freitext durchsucht werden.
11. **Tabelle exportieren**
      > Die aktuelle Auswahl (Spalten, Zeilen, Jahre) als XLSX für Excel exportieren. Über aus Auswahlfeld *alle Jahre exportieren* kann die gesamte Zeitreihe für die ausgewählten Spalten und Zeilen exportiert werden. Ist keine Spalte oder Zeile ausgewählt werden alle verwendet.
12. **Kartenvisualisierung**
      > Die Darstellung in der Karte entspricht der des Kontrollfeldes [Kartenanalyse regionalstatistischer Daten](#markdown-header-kartenanalyse-regionalstatistischer-daten).

#### Burgermenü
![Abbildung 28: Statistische Datenübersicht - Burgermenü](../cosi/utils/assets/screenshots/statdashboard_burgermenu.png)
*Abbildung 28: Statistische Datenübersicht*

1. **Visualisierung ein-/ausschalten**
   > Thematische Gruppen
2. **Zeitreihe in der Karte animieren**
   > *(Funktioniert nur bei aktiver Kartenvisualisierung)*
3. **Gebietsnamen ein-/ausblenden**
   > *(Funktioniert nur bei aktiver Kartenvisualisierung)*
4. **Für Feld A auswählen**
   > Selektiert das Thema als **Feld A** für Berechnungen und Korrelation (siehe 7, 8, 9, 10, 12)
5. **Für Feld B auswählen**
   > Selektiert das Thema als **Feld B** für Berechnungen und Korrelation (siehe 7, 8, 9, 10, 12)
6. **Auswahl aufheben**
   > Setzt die Felder **A** und **B** zurück
7. **Addieren**
   > Addiert die Werte für **A** und **B** für jede Gebietsspalte und fügt das Ergebnis der Tabelle an. Der neue Datensatz kann ebenfalls in der Karte visualisiert und in anderen Werkzeugen verwendet werden.
8. **Subtrahieren**
   > Analog zu **Addieren**, subtrahiert **A** - **B**.
9. **Multiplizieren**
   > Analog zu **Addieren**, multipliziert **A** x **B**.
10. **Dividieren**
      > Analog zu **Addieren**, dividiert **A** / **B**.
11. **Diagramme erzeugen**
      > Erzeugt Diagramme für den ausgewählten Indikator im [Chartgenerator](#markdown-header-chartgenerator) (analog zu [Kartenanalyse regionalstatistischer Daten](#markdown-header-kartenanalyse-regionalstatistischer-daten)). Visualisiert alle ausgewählten Spalten (s. [Statistische Datenübersicht](#markdown-header-statistische-datenübersicht)).
12. **Korrelations- / Streuungsdiagramm**
      > Visualisiert ein Streuungsdiagramm für die Felder **A** (Y-Achse) über **B** (X-Achse) im [Chartgenerator](#markdown-header-chartgenerator) und berechnet die Korrelation (Pearson) zwischen den Datensätzen und zeichet eine Regressionsgerade.

---
### Einrichtungsübersicht
![Abbildung 29: Einrichtungsübersicht](../cosi/utils/assets/screenshots/einrichtungsuebersicht.png)
*Abbildung 29: Einrichtungsübersicht*

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
   > Alle Attribute einer Einrichtung, die Zahlwerte abbilden (welche auch für die [Versorgungsanalyse](#markdown-header-versorgungsanalyse) verwendet werden können) werden in einer eigenen Spalte dargestellt. Die Farbe des Balkens richtet sich dabei nach dem Dezil des Wertes in der Liste aller Einrichtungen. Die Länge des Balkens ist proportional zum Höchstwert.
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

### Gebietsauswahl
___
Beim Starten von CoSI wird zunächst ein Bezugsrahmen festgelegt sowie ein Planungsgebiet zusammengestellt und bestätigt.

![Abbildung 30: Gebietsauswahl](https://user-images.githubusercontent.com/43250699/142933538-fd2e1dbc-8bef-444a-bc7f-66d0066a457e.png)

*Abbildung 30: Das Werkzeug "Gebiet auswählen"*  

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


![Abbildung 31: Fenster zur Kartenanalyse statistischer Daten](https://user-images.githubusercontent.com/43250699/142934510-c2a59330-4630-4ff3-9e3d-eb5305fc91f2.png)  

*Abbildung 31: Fenster zur Kartenanalyse statistischer Daten*  

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

![Abbildung 1: Chartgenerator](https://user-images.githubusercontent.com/43250699/157070471-84b8aca7-44f9-47cb-9de2-2284a43062f4.png)  
*Abbildung 1: Chartgenerator*

1. **Diagrammtyp auswählen**
   > Häufig werden gleich unterschiedliche Graphen erstellt. Hier können Sie zwischen den verfügbaren Diagrammen für den ausgewählten Datensatz umschalten.
2. **Graph & Legende**
   > Das augewählte Diagramm. Sie finden hier den Titel des ausgewählten Datensatzes, die Legende und den erzeugten Graphen.
3. **Y-Achse skalieren**
   > Hier wählen Sie aus, ob die Y-Achse des Graphen von 0 an beginnt oder relativ zum kleinsten verfügbaren Wert.  
   *Diese Funktion ist nur beim Liniendiagramm verfügbar.*
4. **Y-Achse stapeln**
    > Die Werte der Datensätze werden aufsummiert und farblich abgetrennt dargestellt.
5. **Pagination**
   > Die [Pagination](./pagination.md) verwaltet die unterschiedlichen erstellten Graphen und bietet einige standardisierte Funktionen, zu denen Sie [hier](./pagination.md) mehr erfahren können.

### Pagination
Die Pagination unterstützt in einigen Werkzeugen die Verwaltung mehrerer Datensätze, die ihr zugrunde liegenden Funktionen sind aber standardisiert und werden im Folgenden näher erläutert. 
  


![Pagination des Werkzeugs "Vergleichbare Gebiete ermitteln"](https://user-images.githubusercontent.com/43250699/157007454-80d78c08-e141-4384-85ea-435a93ca3356.png)

*Abbildung 1: Pagination des Werkzeugs "Vergleichbare Gebiete ermitteln"*
  
1. **Direktanwahl eines Datensatzes**
   > Wählen Sie direkt den Datensatz mit dem jeweiligen Index an. Sie können hier auch ablesen, wieviele Datensätze sie aktuell in dem jeweiligen Werkzeug haben.
2. **Vor/ Zurück**
   > Durch Klicken auf einen der Pfeile wird der nächste/ vorherige Datensatz ausgewählt.
3. **Neuen Datensatz hinzufügen** 
   > Je nach Werkzeug wird diese Funktion nicht immer genutzt, sollte der Button aber vorhanden sein, können Sie mit seiner Hilfe einen neuen Datensatz anlegen..
4. **Export**
   > Mit diesem Button können Sie die Ergebnisse des jeweiligen Datensatzes exportieren und speichern. Es können mehrere dieser Buttons existieren, wenn mehrere Formate zum Export angegeben werden.
5. **Alle exportieren**
   > Sie führen die Exportfunktion für alle Datensätze durch. Sollten mehrere Dateitypen angeboten werden, werden alle heruntergeladen. Eventuell müssen Sie in ihrem Browser den Download für mehrere Dateien genehmigen.
6. **Datensatz entfernen**
   > Mit diesem Button löschen Sie einen Datensatz und alle dazugehörigen Ergebnisse.
7. **Alle entfernen**
   > Mit diesem Button entfernen Sie alle Datensätze und setzen das Werkzeug zurück.