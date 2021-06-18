import Tool from "../../../../modules/core/modelList/tool/model";
import SnippetDropdownModel from "../../../../modules/snippets/dropdown/model";
import AdjustParameterView from "./adjustParameter/view";
// import ExportButtonModel from "../../../../modules/snippets/exportButton/model";
import * as Extent from "ol/extent";
import store from "../../../../src/app-store";
import unifyString from "../../utils/unifyString.js";

const CalculateRatioModel = Tool.extend(/** @lends CalculateRatioModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        data: {},
        results: [],
        area: {},
        numerators: {values: []},
        denominators: {values: []},
        resolution: 1,
        modifier: {},
        numDropdownModel: {},
        denDropdownModel: {},
        message: "",
        adjustParameterView: {},
        // exportButtonModel: {},
        modifierInfoText: "<h3>Parameter wählen:</h3>" +
            "<p>Hier können Sie zwischen allen verfügbaren Feldern des Einrichtungstyps wählen (z.B. absolute Anzahl, Fläche in m², Schulplätze, etc.)<br />" +
            "Die wählbaren Werte können vom Administrator festgelegt werden. Sollte keine Festlegung erfolgt sein, werden alle numerischen Werte angeboten.<br /></p>" +
            "<h4>Faktor (F):</h4>" +
            "<p>Hiermit können Sie eine beliebige Gewichtung für die Berechnung der Angebots/Zielgruppen-Verhältnisse festlegen um die Deckung der Nachfrage zu überprüfen.<br />" +
            "z.B.: 'Wieviele Quadratmeter pädagogische Fläche benötigt ein Kitakind?'<br /></p>" +
            "<p><strong>Der eingegebene Wert entspricht keinem offiziellen, rechtlich bindenden Schlüssel, sonder dient rein der explorativen Analyse.</strong></p>"
    }),

    /**
     * @class CalculateRatioModel
     * @extends Tool
     * @memberof Tools.CalculateRatio
     * @constructs
     * @listens ModelList#RadioTriggerUpdatedSelectedLayerList
     */
    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    let demographicValueList = store.getters["Tools/DistrictLoader/mapping"];

                    demographicValueList = demographicValueList.filter(function (layer) {
                        return layer.valueType === "absolute";
                    });

                    this.updateFacilityLayerList(Radio.request("ModelList", "getModelsByAttributes", {type: "layer", isVisibleInMap: true}));
                    this.setDemographicDropdownModel(demographicValueList);
                }
            },
            "change:numerators": this.createModifier
        });


        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.updateFacilityLayerList
        }, this);

        // this.setExportButton();
    },

    /**
     * adds potential facility types to Dropdown
     * @param {Backbone.Model} layerList the layers from ModelList
     * @returns {void}
     */
    updateFacilityLayerList: function (layerList) {
        if (this.get("isActive")) {
            const facilityLayerList = layerList.filter((layer) => {
                return layer.get("isFacility") === true;
            });

            this.setFacilityLayerList(facilityLayerList);
            this.setFacilityDropdownModel(facilityLayerList);
        }
    },

    /**
     * sets the layerList for facilites as property
     * @param {Backbone.Model} layerList the layers from ModelList
     * @returns {void}
     */
    setFacilityLayerList: function (layerList) {
        this.set("facilityLayerList", layerList);
    },

    /**
     * sets the Dropdown snippet for the facility types
     * @param {Backbone.Model} layerList the layers from ModelList
     * @fires renderFacilityDropDown
     * @returns {void}
     */
    setFacilityDropdownModel: function (layerList) {
        const layerNameList = layerList.map(layer => {
            return layer.get("name");
        });

        this.set("numDropdownModel", new SnippetDropdownModel({
            name: "Einrichtungen",
            type: "string",
            displayName: "Themen auswählen",
            values: layerNameList,
            snippetType: "dropdown",
            isMultiple: false
        }));
        this.listenTo(this.get("numDropdownModel"), {
            "valuesChanged": this.setNumerators
        });
        this.trigger("renderFacilityDropDown");
    },

    /**
     * sets the Dropdown snippet for the demographic groups
     * @param {Backbone.Model} layerList the layers from ModelList
     * @returns {void}
     */
    setDemographicDropdownModel: function (layerList) {
        this.set("denDropdownModel", new SnippetDropdownModel({
            name: "Zielgruppe",
            type: "string",
            displayName: "Bezugsgröße auswählen",
            values: layerList,
            snippetType: "dropdown",
            isMultiple: true,
            isGrouped: true
        }));
        this.listenTo(this.get("denDropdownModel"), {
            "valuesChanged": this.setDenominators
        });
    },

    /**
     * gets the export data as an array of objects from the calculation results object
     * @returns {Object[]} the export ready array of object
     */
    getExportData () {
        const rawData = this.get("results"),
            data = [];

        for (const area in rawData) {
            data.push({
                [`Gebiet (${store.getters["Tools/DistrictSelector/label"]})`]: area,
                [`${this.get("numerators").values[0]} (${this.get("modifier")[0]})`]: rawData[area].facilities,
                [this.get("denominators").values.join(", ")]: rawData[area].demographics,
                Kapazität: rawData[area].capacity,
                "Bedarf (Soll-Wert)": rawData[area].demand,
                [`${this.get("modifier")[0]} / Bezugsgröße`]: rawData[area].ratio,
                "Unter- / Überversorgung (1,0 ~ 100%)": rawData[area].coverage
            });
        }

        return data;
    },

    /**
     * creates the result object for the demographic/facility ratio for each selected district and total and mean
     * @fires renderResults
     * @returns {void}
     */
    getRatiosForSelectedFeatures: function () {
        this.resetResults();
        this.set("modifier", this.get("adjustParameterView").model.getSelectedOption());

        const renameResults = {},
            selectedDistricts = store.getters["Tools/DistrictSelector/selectedFeatures"],
            // selectedDistricts = Radio.request("SelectDistrict", "getSelectedDistricts"),
            selector = store.getters["Tools/DistrictSelector/keyOfAttrName"];
            // selector = Radio.request("SelectDistrict", "getGeomSelector");
        let facilities,
            demographics,
            ratio,
            totalFacilities = 0,
            totalDemographics = 0,
            totalRatio;

        if (selectedDistricts.length > 0) {
            selectedDistricts.forEach((district) => {
                // get the facilities and demographics for each district
                facilities = this.getFacilitiesInDistrict(district);
                demographics = this.getTargetDemographicsInDistrict(district);

                // add up all demographics and facilities for all selected districts
                totalFacilities += facilities;
                totalDemographics += demographics;

                // calculate Ratio for district
                ratio = this.calculateRatio(facilities, demographics, district.getProperties()[selector]);
                this.setResultForDistrict(district.getProperties()[selector], {
                    ratio: ratio, // the simple ratio between target group and facility value
                    capacity: facilities * this.get("modifier")[1], // number of people the given facility property can accomodate
                    demand: demographics / this.get("modifier")[1], // necessary facility value to accomodate all people of the target group
                    coverage: ratio * this.get("modifier")[1] * this.get("resolution"), // percentage of demand met as decimal, modified by resolution (e.g. calc per 1000 ppl)
                    // coverage: Math.round(ratio * this.get("modifier")[1] * 100 * this.get("resolution")), // percentage of demand met, modified by resolution (e.g. calc per 1000 ppl)
                    facilities: facilities, // facility value (e.g. sqm)
                    demographics: demographics, // target group
                    f: this.get("modifier")[1] // modifier "f"
                });
            });
            // Calculate total value and add it to results
            totalRatio = this.calculateRatio(totalFacilities, totalDemographics);
            this.setResultForDistrict("Gesamt", {
                ratio: totalRatio,
                capacity: totalFacilities * this.get("modifier")[1],
                demand: totalDemographics / this.get("modifier")[1],
                coverage: totalRatio * this.get("modifier")[1] * this.get("resolution"),
                // coverage: Math.round(totalRatio * this.get("modifier")[1] * 100 * this.get("resolution")),
                facilities: totalFacilities,
                demographics: totalDemographics,
                f: this.get("modifier")[1]
            });
            this.setResultForDistrict("Durchschnitt", this.calculateAverage(this.getResults()));
        }
        else {
            this.setMessage("Bitte wählen Sie mindestens einen Stadtteil aus.");
        }

        Object.keys(this.getResults()).forEach(function (objectKey) {
            renameResults[objectKey] = Radio.request("Util", "renameKeys", {
                ratio: "Verhältnis",
                coverage: "Abdeckung (%)",
                facilities: `${this.getNumerators()[0]} (${this.get("modifier")[0]})`,
                demographics: this.getDenominators().join(", "),
                demand: "Bedarf (Soll)",
                capacity: "Kapazität",
                f: "Faktor (F)"
            }, this.getResults()[objectKey]);
        }, this);
        // this.get("exportButtonModel").set("rawData", renameResults);
        this.trigger("renderResults");
    },

    /**
     * calculates the ratio for the given values or returns "n/a"
     * @param {number} facilities the modified facility value
     * @param {number} demographics the modified demographics value
     * @param {string} area the area to calculate the ratio for
     * @returns {number | string} the calculated ratio
     */
    calculateRatio (facilities, demographics, area = "allen Unterschungsgebieten") {
        if (demographics >= 0) {
            return facilities / demographics;
        }
        this.setMessage(`In ${area} ist keine Population der Zielgruppe vorhanden. Daher können keine Ergebnisse angezeigt werden.`);
        return "n/a";
    },

    calculateAverage (results) {
        const districtResults = Object.entries(results).filter(res => res[0] !== "Gesamt"),
            n = districtResults.length;

        return {
            ratio: districtResults.reduce((sum, district) => sum + district[1].ratio, 0) / n,
            capacity: results.Gesamt.capacity / n,
            demand: results.Gesamt.demand / n,
            coverage: districtResults.reduce((sum, district) => sum + district[1].coverage, 0) / n,
            facilities: results.Gesamt.facilities / n,
            demographics: results.Gesamt.demographics / n,
            f: this.get("modifier")[1]
        };
    },

    /**
     * retrieves the relevant target demographics by district
     * @param {*} district the feature of the district
     * @param {*} selector the demographics attribute to retrieve
     * @returns {number} the target population for the latest year
     */
    getTargetDemographicsInDistrict: function (district) {
        let targetPopulation = 0;
        const selector = store.getters["Tools/DistrictSelector/keyOfAttrNameStats"],
            geomSelector = store.getters["Tools/DistrictSelector/keyOfAttrName"];

        if (typeof this.getDenominators() !== "undefined") {
            if (this.getDenominators().length > 0) {
                this.getDenominators().forEach((den) => {

                    const districtFeature = store.getters["Tools/DistrictLoader/currentStatsFeatures"]
                        .filter(feature => {
                            if (feature.get("kategorie") === den) {
                                const featureName = unifyString(feature.get(selector)),
                                    districtName = unifyString(district.get(geomSelector));

                                return featureName === districtName;
                            }
                            return false;
                        });

                    if (districtFeature) {
                        const districtProperties = districtFeature[0].getProperties(),
                            field = Radio.request("Timeline", "getLatestFieldFromProperties", districtProperties);

                        targetPopulation += parseInt(districtProperties[field], 10);
                    }
                    else {
                        this.setMessage("Entschuldigung! Der zu prüfende Layer besitzt keine gültige Spalte für Verhältnisanalysen. Bitte wählen Sie einen anderen Layer aus.");
                    }
                });
            }
            else {
                this.setMessage("Bitte wählen Sie eine demografische Zielgruppe aus.");
            }
        }
        else {
            this.setMessage("Bitte wählen Sie eine demografische Zielgruppe aus.");
        }

        return targetPopulation;
    },

    /**
     * retrieves the relevant facility values by district (based on the coordinates of the facilities)
     * @param {*} district the feature of the district incl. its geometry
     * @returns {number} the facility value (e.g. area in sqm)
     */
    getFacilitiesInDistrict: function (district) {
        const districtGeometry = district.getGeometry();
        let featureCount = 0;

        if (typeof this.getNumerators() !== "undefined") {
            if (this.getNumerators().length > 0) {
                this.getNumerators().forEach((num) => {
                    const layer = this.get("facilityLayerList").find((facilityLayer) => {
                            return facilityLayer.get("name") === num;
                        }),
                        features = layer.get("layerSource").getFeatures().filter(f => typeof f.style_ === "object" || f.style_ === null);

                    features.forEach((feature) => {
                        const geometry = feature.getGeometry(),
                            coordinate = geometry.getType() === "Point" ? geometry.getCoordinates() : Extent.getCenter(geometry.getExtent()); // Remove later for more reliable fallback

                        if (districtGeometry.intersectsCoordinate(coordinate)) {
                            featureCount += parseFloat(feature.getProperties()[this.get("modifier")[0]]) || 1;
                        }
                    });
                });
            }
            else {
                this.setMessage("Bitte wählen Sie ein Thema aus.");
            }
        }
        else {
            this.setMessage("Bitte wählen Sie ein Thema aus.");
        }

        return featureCount;
    },

    /**
     * creates a new modifier view for all selected facility types
     * @returns {void}
     */
    createModifier: function () {
        if (this.getNumerators().length > 0) {
            const layer = this.get("facilityLayerList").find((facilityLayer) => {
                return facilityLayer.get("name") === this.getNumerators()[0];
            });

            this.set("adjustParameterView", new AdjustParameterView(layer.get("id"), this.get("modifierInfoText")));
        }
    },

    /**
     * Compensates for inconstistencies in naming by removing spaces and first capitals
     * @param {*} str the string / tag to convert
     * @returns {string} the converted string
     */
    unifyString: function (str) {
        if (typeof str === "string") {
            return str.replace(/\s/g, "").replace(/^\w/, c => c.toLowerCase());
        }
        return str;
    },

    /**
     * sets the selected numerators (facilities)
     * @returns {void}
     */
    setNumerators: function () {
        this.set("numerators", this.get("numDropdownModel").getSelectedValues());
    },

    /**
     * sets the selected denominators (demographics)
     * @returns {void}
     */
    setDenominators: function () {
        this.set("denominators", this.get("denDropdownModel").getSelectedValues());
    },

    /**
     * gets the selected numerators (facilities)
     * @returns {string[]} the selected facility types
     */
    getNumerators: function () {
        return this.get("numerators").values;
    },

    /**
     * gets the selected (denominators) demographics
     * @returns {string[]} the selected demographics
     */
    getDenominators: function () {
        return this.get("denominators").values;
    },

    /**
     * sets the results for the district in results object
     * @param {string} district name/selector
     * @param {object} ratio result object
     * @returns {void}
     */
    setResultForDistrict: function (district, ratio) {
        this.get("results")[district] = ratio;
    },

    /**
     * resets the result object and error message
     * @returns {void}
     */
    resetResults: function () {
        this.set("results", {});
        this.set("message", "");
    },

    /**
     * gets the result object
     * @returns {object} results
     */
    getResults: function () {
        return this.get("results");
    },

    /**
     * sets potential error messages to render
     * @param {string} message the message to display
     * @returns {void}
     */
    setMessage: function (message) {
        this.set("message", message);
    }
});

export default CalculateRatioModel;
