# Data model & infrastructure
CoSI is essentially based on the superimposition of regularly updated regional statistical characteristics of the individual area levels, which are supplied by the North Statistics Office for Hamburg and Schleswig-Holstein (StaNord), and various specialist data from the various authorities, such as the digital green plan (BUKEA) or the public schools (BUE). In doing so, CoSI tries to do more than just ensure that the data records are displayed next to and on top of each other in the map and table. The aim is to achieve an integration of the data and an interaction with the data. So on the one hand to make connections and interactions between different data sets tangible for the users and on the other hand to allow them to “intervene” in the data sets, to filter, search or “manipulate” them. The latter,
## Regional statistical data
The StaNord data is available for all administrative levels of the FHH (statistical areas, city districts, districts and the entire city). Depending on the level, they include over 60 indicators, which are divided into the categories
-	Population
-	Surface
-	Households
-	Social security obligations
-	Unemployed
-	SGB II benefits
-	Basic security in old age
-	Living
-	Traffic

structure (for a precise list, see appendix). These data sets contain time series, which are recorded from approx. 2012 (depending on the data set) and are expanded annually.

*Note: For reasons of data protection law, the data provider filters out those data sets which, in the case of sensitive data, could be traced back to individual individuals. These data records are shown in "-" or with "No data".*

#### `Datensatz (Bsp.)`
| `Verwaltungseinheit`        | `Stadtteil`
------------ | -------------
`Bezirk` | `Hamburg-Nord`
`Stadtteil` | `Groß-Borstel`
`Kategorie` | `soz_sozverpflichtig_beschaeftigte_maenner_15_bis_u65_ant`
`2011` | `53,4`
`2012` | `53,6`
`...` | `...`
`2017` | `56,2`
`2018` | `55,6`

#### `Features loader`
`All StaNord data, like all other specialist data, are provided by geospatial service. As shown in the example above, the data structure of the data not only provides each data record as a separate data object (feature) for each geographical area, at each administrative level. Each feature is also linked to its geographic geometry. In other words, it is not possible to load a single feature with all the data records, but the request must be made for each indicator individually. The Features Loader is the CoSI-specific module which, when selecting the area, requests the collected data sets from the server excluding the geometry (for performance reasons) and then links these within the application with the area shown on the map.`

### Technical data
The technical data sets that are and can be integrated in CoSI are provided as geospatial services by a wide variety of data owners (above all authorities, but in principle also private companies, real-time sensors, etc.) and accessed in CoSI, as in the FHH Atlas, via the URL of the respective service . Many of the data sets in their edited form emerged from the negotiation and coordination processes of the Urban Data Hub, through which the authorities and data holders of the FHH agree on common standards and regular publications.
### Analysis
Analysis data are all those data sets integrated (as WFS, see geospatial services) that have been configured for use with the CoSI analysis (and in future simulation) tools. In other words, each object (feature, eg day care center or green space) is stored individually and can be viewed with its geographical position and extent.
### Presentation
Representation data are selected data sets from the FHH network in consultation with the specialist planners, which are visualized on the map by the underlying geoportal (master portal) and provided with a legend. The data record for the respective coordinate can be called up from the data record with a click. In contrast to the analysis data, the display data are currently not available as individual objects, but rather as a tiled / rasterized image (WMS, see geospatial services).
### Geospatial services
All data presented in CoSI and the FHH-Atlas are held by the providers as a service. The service delivers data records from the respective database in a machine-readable format via a URL. The request can be specified or limited (e.g. to a geographical section) via additional parameters.
### WMS
A WMS (Web Map Service) delivers geodata / maps as raster images (PNG), which are initially displayed on the map without background information. At the same time, the legend of the data record or information on a specific coordinate can be called up via further requests.
### WFS
In contrast to the WMS, the WFS (Web Feature Service) does not provide a finished map view, but a raw data object in which the data set of each geographical object (point, line, area, etc.) including its attributes (e.g. a school including its type of school, its number of students, email address and afternoon offer). The visualization (styling) of the data then takes place on the basis of predefined or supplied configurations within the application. This is more computationally intensive for the user and less controllable on the part of the data provider, but offers the possibility to interact directly with the objects within the portal or to change them.

## Modules
As is common in contemporary (web) development, and as described in the Structure chapter, CoSI as the instance of the master portal is made up of a number of subject and data-specific modules. 

CoSI offers various modules, some of which are taken from the Master Portal, the others are CoSI-specific. Below is an overview of the tools in two categories:

**1.	CoSI-specific**
1. Analysis:
   1. Map visualization of regional statistical data
   2. Dashboard
   3. Facility overview (in development)
   4. Accessibility analysis
   5. Select area
   6. Identify comparable areas
   7. Supply analysis
1. Simulation: (in development)
   1. Scenario manager
   2. Scenario builder
   3. Neighborhood Builder
1. Services: 
   1. Switch mousehover on / off
   2. Open the second window
 
**2.	Tools adopted from the Master Portal**
1. Analysis:
   1. Resident query
   2. Filter
   3. File import drawings
   4. Measure distance / area
   5. Drawing and writing
1. Services:
   1. Print map
   2. Save session
   3. Add WMS 
    
#### `Adjustments`
`In some cases, the tools from the master portal had to be slightly adapted for CoSI in order to ensure stability within CoSI and to increase the benefit. For example, with the “Print map” tool, unlike in the master portal, individually styled map elements are also output, for which there was no need in the master portal. Additional tools such as “Filter” and “Resident Survey” have been adapted or expanded to increase their usability in CoSI. With the filter, a list of results is generated and can be transferred to the dashboard (push). The resident query was integrated into the accessibility analysis and thus enables an address-specific query of the number of residents for a generated catchment area. Various other (partly also purely cosmetic) adjustments to the UI flow from CoSI back into the core architecture of the mast portal.`

### Overview

![Pic1](https://user-images.githubusercontent.com/79461871/126049361-e99d3eb9-ef8a-47d1-ac2a-a2eaf6833100.png)

1. **Topic tree / topic layer** (see topics)
2. **Analysis functions** (see analysis)
3. **Simulation functions** (not yet available)
4. **Services** (see services)
5. **Legend** (see legend)
6. **Dashboard** (see dashboard)
7. **Area selection** (see area selection)
8. **Contact form** - Requests, comments, comments and error reports can be sent directly to the project team or the technical control center 
9. **Search bar** - You can search for locations, addresses, B-plans, as well as active features (day care centers, sports facilities, etc.) in the map
10.	**Tool window** - Active tools are displayed in the movable window
11.	**Sidebar** - The dashboard and the filter are displayed in the sidebar, which remains open even when other tools are used. The width of the sidebar can be adjusted. (see dashboard)
12.	**Zoom in**
13.	**Zoom out**
14.	**Focus on the selected area**
15.	**Map visualization of regional statistical data / control element****
16.	**Tooltip (mouse hover)** - Displays the area and other items under the mouse pointer. Can be deactivated under "Services" via "Switch mouse hover on / off".
17.	**Selected areas** - Selected areas are shown with a blue border.

*Note: The simulation function has not yet been activated.*

*General note: Each (CoSI-specific) module offers a help button (question mark symbol) with information and explanations. Wherever possible and necessary, all elements are provided with explanatory tooltips, which appear when the mouse pointer pauses briefly over the element.*

### Themes (layers)
Layers can be switched on or off at any time from the “Themes” tab. However, when connecting, it must be taken into account that the loading times can be correspondingly longer if no planning area has been specified beforehand, as the data must then be loaded for the entire Hamburg area. The topics are sorted under technical data.

The topic tree is divided into background maps, a catalog of specialist data and the current selection of map levels.





