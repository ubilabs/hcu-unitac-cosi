// import storeOriginalDistrictStats from "../utils/storeOriginalDistrictStats";
import getAvailableYears from "../../utils/getAvailableYears";
import getIntersectionCoverage from "../../ResidentialSimulation/utils/getIntersectionCoverage";
import {getAllContainingDistricts} from "../../utils/geomUtils";
import store from "../../../../src/app-store";

/**
 * @description Stores the scenario specific properties of a residential district feature
 * @class ScenarioNeighborhood
 */
export default class ScenarioNeighborhood {
    /**
     * Constructor for class ScenarioFeature
     * @param {module:ol/Feature} feature the OpenLayers Feature created
     * @param {module:ol/layer/Vector} layer the OpenLayers layer to render the feature on
     * @param {Object[]} districtLevels The district levels to compute the containing districts for
     */
    constructor (feature, layer, districtLevels) {
        this.feature = feature;
        this.layer = layer;
        this.active = false;
        this.activeDistrictLevels = districtLevels;

        this.computeContainingDistricts(districtLevels);
    }

    /**
     * Renders the feature to the map and tags it if a guidelayer is provided
     * @todo store tag on the class?
     * @param {module:ol/layer/Vector} guideLayer - the guideLayer to draw tags to
     * @returns {void}
     */
    renderFeature () {
        if (this.active) {
            return;
        }
        this.modifyDistrictStats();
        this.layer.getSource().addFeature(this.feature);
        this.active = true;
    }

    /**
     * removes the feature and the tag from the map
     * @todo remove tag directly without searching the guideLayer
     * @returns {void}
     */
    hideFeature () {
        if (!this.active) {
            return;
        }
        this.resetDistrictStats();
        this.layer.getSource().removeFeature(this.feature);
        this.active = false;
    }

    /**
     * Checks which district contains a given feature
     * and calculates how much of the neighborhood lies within each district
     * @param {Object[]} districtLevels - the districtlevels to check
     * @returns {void}
     */
    computeContainingDistricts (districtLevels) {
        const districts = getAllContainingDistricts(districtLevels, this.feature, true);

        this.districts = districts.map(item => {
            return {
                coverage: item.district.adminFeature
                    ? getIntersectionCoverage(this.feature, item.district.adminFeature)
                    : 1,
                ...item
            };
        });
    }

    /**
     * Updates the surrounding districts' statistics based on the stats of the neighborhood
     * @todo move to district methods?
     * @returns {void}
     */
    async modifyDistrictStats () {
        for (const item of this.districts) {
            await store.dispatch("Tools/DistrictSelector/getStatsByDistrict", {
                id: item.district.getId(),
                districtLevel: this.activeDistrictLevels
                    .find(level => level.label === item.districtLevel)
            });

            // if no stats could been fetche for the district, don't try to alter it
            if (item.district.statFeatures.length === 0) {
                console.warn(`No statistics have been loaded for ${item.district.getName()}. Cannot apply neighborhood stats.`);
                continue;
            }

            const years = getAvailableYears(item.district.statFeatures),
                completion = new Date(this.feature.get("year")).getFullYear();
            let year, originalVal;

            for (const datum of this.feature.get("stats") || []) {
                /**
                 * @todo IT'S JUST A PROTOTYPE
                 */
                if (datum.valueType === "absolute") {
                    const districtDatum = item.district.statFeatures.find(d => d.get("kategorie") === datum.category);

                    // if a feature is missing, go on
                    if (!districtDatum) {
                        continue;
                    }

                    for (year of years.filter(y => y >= completion)) {
                        originalVal = parseFloat(districtDatum.get("jahr_" + year)) || 0;
                        districtDatum.set("jahr_" + year, originalVal + Math.round(datum.value * item.coverage));
                    }

                    // store modification date on the statsfeature
                    districtDatum.set("isModified", completion);
                }
                else if (datum.relation) {
                    /** @todo auto generate relative values */
                }
            }
        }

        store.dispatch("Tools/DistrictSelector/updateDistricts");
    }

    /**
     * Resets the surrounding districts' statistics to their original
     * @returns {void}
     */
    resetDistrictStats () {
        for (const item of this.districts) {
            item.district.statFeatures = item.district.originalStatFeatures.map(feature => feature.clone());
        }

        store.dispatch("Tools/DistrictSelector/updateDistricts");
    }
}
