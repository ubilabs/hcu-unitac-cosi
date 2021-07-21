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

# Modules
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

## Overview

![Illustration 1 The CoSI UI](https://user-images.githubusercontent.com/79461871/126049907-9316494b-3228-4d76-bcdc-ec51fe53b750.png)

*Illustration 1: The CoSI UI*

1. **Topic tree / topic layer** (see topics)
2. **Analysis functions** (see analysis)
3. **Simulation functions** (not yet available)
4. **Services** (see services)
5. **Legend** (see legend)
6. **Dashboard** (see dashboard)
7. **Area selection** (see area selection)
8. **Contact form** - Requests, comments, comments and error reports can be sent directly to the project team or the technical control center 
9. **Search bar** - You can search for locations, addresses, B-plans, as well as active features (day care centers, sports facilities, etc.) in the map
10. **Tool window** - Active tools are displayed in the movable window
11. **Sidebar** - The dashboard and the filter are displayed in the sidebar, which remains open even when other tools are used. The width of the sidebar can be adjusted. (see dashboard)
12. **Zoom in**
13. **Zoom out**
14. **Focus on the selected area**
15. **Map visualization of regional statistical data / control element****
16. **Tooltip (mouse hover)** - Displays the area and other items under the mouse pointer. Can be deactivated under "Services" via "Switch mouse hover on / off".
17. **Selected areas** - Selected areas are shown with a blue border.

*Note: The simulation function has not yet been activated.*

*General note: Each (CoSI-specific) module offers a help button (question mark symbol) with information and explanations. Wherever possible and necessary, all elements are provided with explanatory tooltips, which appear when the mouse pointer pauses briefly over the element.*

## Themes (layers)
Layers can be switched on or off at any time from the “Themes” tab. However, when connecting, it must be taken into account that the loading times can be correspondingly longer if no planning area has been specified beforehand, as the data must then be loaded for the entire Hamburg area. The topics are sorted under technical data.

The topic tree is divided into background maps, a catalog of specialist data and the current selection of map levels.

![Illustration 2 - The topic tree](https://user-images.githubusercontent.com/79461871/126049893-b4aec557-d456-49b1-85ba-39e824f7fbcf.png)

*Illustration 2: The topic tree*

1.	**Background maps** - Layers such as "City Map Hamburg", which are automatically active by default. If necessary, the "DOP 2 aerial maps" layer can also be activated. They can also be deactivated.
2.	**Technical data** - 
	   a.	**Analysis / Simulation** - The prepared layers for CoSI-specific tools (provided as WFS, see glossary). The individual data layers are divided into categories that are regularly adapted or updated.
      b.	**Presentation** - Data for pure "display" in the map, mainly taken from the FHH Atlas (provided as WMS). 
3.	**Selected topics** - The active layers can be moved in their order and made transparent
4.	**Layer info** - The legend and metadata of the specialist data layer can be displayed via the info button. This includes a description of the topic, the date of publication and the URL of the relevant service. The function is the same for all FHH geoportals.

The topics contain information that is represented symbolically or by areas on the map. In Figure 4, for example, the red dots represent the existing daycare centers in the area, while the purple lines represent areas that belong to the development plans layer.  

A legend on the active topics can be displayed by clicking on the "Legend" tab. Independently of this, further information on the respective topic can be called up by clicking on the info button to the right of the layer. Information such as a brief description of the topic including the data status and a legend on the topic are displayed. There are also links to download sources and a WFS or WMF address behind the info button.  

Clicking on an object on the map opens an information panel for the current selection (sports facility, daycare center, etc.). Information about the object is displayed on the information board. Data relevant to data protection (personal) are not displayed.  

It is possible to adjust the order and the transparency of the active layers: Under "Selected topics" there is an info button and a setting wheel for each selected topic. A click on the wheel opens the setting options for order and transparency.

## Accessibility

Various aids have been created in CoSI to make it easier to read.

![Illustration 3 - Help with accessibility](https://user-images.githubusercontent.com/79461871/126124092-6ed33e7c-6c1f-47f9-9714-bce050c218c6.png)

*Illustration 3 - Help with accessibility*

1. **Integration of a new chart library** - I.a. retrievable via the map visualization of regional statistical data. Basically applies to all functions / services that offer charts.
2. **Improve readability**  the chart diagrams / evaluations - Choice between bar and chart diagrams
3. **Change view** - Two options can be selected: thick or thin area boundaries
4. **Tool tips** - Tool tips have been integrated into all new tools. The tips can be called up via the question marks that become visible when you move the mouse over the window.
5. **Emphasis on clustered facilities** - Several facilities that are close together are displayed as a “cluster” with a single symbol and the number of facilities at the location (see below).

![Illustration 4th - clustered entities](https://user-images.githubusercontent.com/79461871/126124516-34fcf642-aa4c-49b4-898a-f40a4d023b52.png)

*Illustration 4th - clustered entities*

## Analysis

![Illustration 5 - analysis](https://user-images.githubusercontent.com/79461871/126124635-b72c137e-3acd-4b8d-bd8f-927ca3aafb5f.png)

*Illustration 5 - analysis*

1. **Facility overview** - Calls up a table overview of the selected facilities and enables individual sorting / filtering as well as an export.
2. **Resident query** - Address-specific query of the population from the StaNord
3. **Accessibility analysis**
   - Accessibility from a reference point
   - Accessibility in one area
4. **Filter** - Filter specialist data (schools, green spaces, etc.) according to parameters
5. **KML import** - Import created and saved drawings
6. **Measure distance / area**
7. **Identify comparable areas** - Select areas in Hamburg according to parameters
8. **Supply analysis** - Determine the relationship between institutions (specialist data) and target groups (StaNord data) in the area
9. **Drawing / writing** - Add and export your own drawings on the map

*Note: The facility overview is not yet activated for production.*

### Resident query
Basically, this function offers the possibility of determining the exact number of residents by drawing a rectangle or circle or by drawing an area. This tool comes from the master portal and has been integrated into the module “accessibility analysis”.

When calling up directly under the "Analysis" tab, the area over which the query is to be carried out must be specified manually (by drawing a rectangle or circle or by drawing an area).

When used within the context of the accessibility analysis, the area does not have to be specified manually, but the calculated catchment area is adopted as the area.
### Accessibility analysis
An accessibility analysis can be carried out in two ways: 1) from a reference point and 2) in the planning area. The mode of analysis can be selected in the dropdown menu.

**Important information:**
This tool was implemented using OpenRouteService, a service developed and provided by the Heidelberg Institute for Geoinformation Technology. Use is covered by the Creative Commons license CC BY 4.0. Further information can be found at: https: // heigit. org / de / ortsbasierte-dienste-und-navigation / https: //openrouteservice.org/services/

**1) Accessibility from a reference point**
Indicates an area that can be reached from a point on the map selected by the user within a distance specified by the user. The distance can be given in time or in meters. Accessibility is calculated based on the means of transport specified by the user. The polygons are automatically adjusted when the mode of transport or other parameters are changed.

The module can be used without first selecting and confirming a planning area. 

![Illustration 6th - Accessibility from a reference point](https://user-images.githubusercontent.com/79461871/126127347-80b8548e-f908-4bf8-87f8-e3c5262d57ac.png)

*Illustration 6th - Accessibility from a reference point*

1. **Reference point** - Any reference point is set on the map.
2. **Define means of transport** - The means of transport is selected from a list. The following modes of transport are currently available: car, bike, bike (electric), walking, wheelchair.
3. **Specify the unit of measurement for the distance** - Specify whether the distance is given in minutes or meters.
4. **Distance** - Enter the distance in a previously defined unit of measurement (minutes or meters).
5. **Info, back to selection, delete polygon** - The Info button contains further information about the module. With the arrow to the left you navigate back to the selection between accessibility from a reference point and accessibility in the area. The polygon can be deleted by clicking on the trash can.
6. **Legend** - A legend is displayed. It is generated dynamically for the heat map and shows three evenly distributed distance values. The maximum value is the previously entered value for the distance.
7. **Facility cover** - Provides all facilities of the active layers that are located within the catchment area (heat map) in a drop-down list. When you click on a facility in the list, the position marker moves to the facility. More information about the facility can be found by clicking the facility.
8. **Zoom** -The heat map is focused in the center.
9. **Inhabitants query for the area** - Carries out an address-specific resident query for the catchment area, which is represented by the polygon.
10. **Polygon** - Shows the area that can be reached from the reference point as a heat map, depending on the previously entered parameters.

**2) Accessibility in the area**
Shows the coverage and accessibility of a previously specified type of facility (e.g. kindergartens) in the specified catchment area (planning area). The catchment area is the distance from the respective facility and can be specified in time or in meters. Accessibility depends on the means of transport specified.

![Illustration 7th - Accessibility in the area](https://user-images.githubusercontent.com/79461871/126128355-fe9be018-4ea4-4c44-b5a3-da99cbb77fcb.png)

*Illustration 7th - Accessibility in the area*

1. **Select layer** - In order for this module to be used, at least one layer must be active.
2. **Define means of transport** - The means of transport is selected from a list. The following modes of transport are currently available: car, bike, bike (electric), walking, wheelchair.
3. **Specify the unit of measurement for the distance** - Specify whether the distance is given in minutes or meters.
4. **Distance** - Enter the distance in a previously defined unit of measurement (minutes or meters).
5. **Legend** - A legend is displayed. It is generated dynamically for the heat map and shows three evenly distributed distance values. The maximum value is the previously entered value for the distance.
6. **Polygons** - Show the areas that can be reached from the respective facility as a heatmap, depending on the previously entered parameters. The catchment areas calculated in this way can overlap. This module can be used to make visible where gaps arise with regard to the facility coverage in the area. 	

### Filter
The active, selected topics can be searched and filtered according to the categories of their data sets by clicking on the "Filter" tab. The map automatically zooms in on the filter results. Only results in the selected areas are included. The filter is available for all technical data sets that have meaningful filterable attributes (such as area, use, carrier, etc.).

![Illustration 8th - filters](https://user-images.githubusercontent.com/79461871/126128906-77c77f07-ec73-4371-ad28-90e44433532c.png)

*Illustration 8th - filters*

1. **Select a topic in the filter** - The selected topics are displayed. Topics can be added at any time. To do this, click on the topic structure and select the topic.
2. **Filter options:**
   - Several filter options can be selected. The selection is automatically marked with a tick.
   - Slider (from / to): a desired area size can be entered, for example.
3. **The result is displayed immediately when the filter option is selected:**
   - The result is displayed on the map by a symbol or area color. This is displayed by clicking the “Legend” tab. Mousehover shows information field on facility / area.
   - The names of the areas / facilities are displayed in the search results field. By clicking on the names, the selection is marked on the map.
4. **Delete filter:** Individual selection by clicking the red "X" or delete the entire selection by clicking the "Delete all" button.

### Supply analysis
The "Supply Analysis" tool calculates the relationship between two data records. The data sets can either be regional statistical data or facility data from the menu "Topics / Technical data". In order for the supply analysis to be used, at least two data records must have been loaded.

![Illustration 9 - Supply analysis, settings](https://user-images.githubusercontent.com/79461871/126129882-a458fd2d-fdfb-4cf7-8cf5-c07ce8ae3b5d.jpg)

*Illustration 9 - Supply analysis, settings*

The individual functions of the tool are explained in detail below:
1. Use the button to open this auxiliary window.
2. You can use the button to switch between facility and regional statistical data sets.
3. Use the Select field to select one of the loaded data records.
4. For facility data sets, you can specify a factor (F) that determines how many units of the selected facility are required for the reference data set. For example, if you want to calculate the number of public schools against the number of the population under 18 and give a factor of 0.001, this would mean that one school is required for every 1000 members of the reference group. If a factor (F) is given, the columns "Capacity" and "Demand" are also given in the calculation table. 
5. Some facility records have parameters other than just their number in the selected areas. In public schools, for example, you can query the data record "number of students" or in hospitals the number of stationary places. Not every setup record has additional parameters.

![Illustration 10 - Care analysis, results](https://user-images.githubusercontent.com/79461871/126129990-a50b3506-0232-4aae-b8c0-6c290927be2c.png)

*Illustration 10 - Care analysis, results*

1. **Result** - Results are shown in a table including the total value, as well as in the map, color-coded according to the value.
   - Area
   - Facility: The total number of facilities or the selected parameter of facilities in the area (e.g. m² playground)
   - Target group: The number of people in the (combined) target group in the area
   - Capacity: The number of people who can take care of the facilities, according to factor F
   - Requirement: The value of the parameter of the facilities that would be necessary for the number of people in the area, according to factor F
   - Relationship: The simple relationship between facilities (number or parameters) and (combined) target group in the area




