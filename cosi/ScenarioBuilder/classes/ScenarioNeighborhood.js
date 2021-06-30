import storeOriginalDistrictStats from "../utils/storeOriginalDistrictStats";
import getAvailableYears from "../../utils/getAvailableYears";
import getIntersectionCoverage from "../../ResidentialSimulation/utils/getIntersectionCoverage";
import store from "../../../../src/app-store";

/**
 * @description Stores the scenario specific properties of a residential district feature
 * @class ScenarioNeighborhood
 */
export default class ScenarioNeighborhood {
    /**
     * Constructor for class ScenarioFeature
     * @param {module:ol/Feature} feature the OpenLayers Feature created
     * @param {module:ol/Feature[]} districts the OpenLayers features of the surrounding districts
     * @param {module:ol/layer/Vector} layer the OpenLayers layer to render the feature on
     */
    constructor (feature, districts, layer) {
        this.feature = feature;
        this.layer = layer;
        this.active = false;

        this.districts = districts.map(district => {
            storeOriginalDistrictStats(district);

            return {coverage: getIntersectionCoverage(feature, district), feature: district};
        });
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
     * Updates the surrounding districts' statistics based on the stats of the neighborhood
     * @returns {void}
     */
    modifyDistrictStats () {
        for (const district of this.districts) {

            const years = getAvailableYears(district.feature.get("stats")),
                completion = new Date(this.feature.get("year")).getFullYear();
            let year, originalVal;

            console.log(this.feature);

            for (const datum of this.feature.get("stats")) {
                /**
                 * @todo IT'S JUST A PROTOTYPE
                 */
                if (datum.valueType === "absolute") {
                    const districtDatum = district.feature.get("stats").find(d => d.get("kategorie") === datum.category);

                    for (year of years.filter(y => y >= completion)) {
                        originalVal = parseFloat(districtDatum.get("jahr_" + year)) || 0;
                        districtDatum.set("jahr_" + year, originalVal + Math.round(datum.value * district.coverage));
                    }
                }
                else if (datum.relation) {
                    //
                }
            }
        }
    }

    /**
     * Resets the surrounding districts' statistics to their original
     * @todo refactor DistrictLoader and Dashboard to avoid the weird iteration over the currentStatsFeatures list
     * @returns {void}
     */
    resetDistrictStats () {
        for (const district of this.districts) {
            district.feature.set("stats", district.feature.get("originalData").stats.map(feature => feature.clone()));

            /**
             * @todo JUST A WEIRD HACK
             * REFACTOR DISTRICTLOADER
             */
            const currentStatsFeatures = store.getters["Tools/DistrictLoader/currentStatsFeatures"],
                keyOfAttrNameStats = store.getters["Tools/DistrictSelector/keyOfAttrNameStats"];

            if (currentStatsFeatures) {
                for (let i = 0; i < currentStatsFeatures.length; i++) {
                    const clonedFeature = district.feature.get("stats").find(f => {
                        return f.get("kategorie") === currentStatsFeatures[i].get("kategorie")
                            && f.get(keyOfAttrNameStats) === currentStatsFeatures[i].get(keyOfAttrNameStats);
                    });

                    if (clonedFeature) {
                        currentStatsFeatures[i] = clonedFeature;
                    }
                }

                store.commit("Tools/DistrictLoader/setCurrentStatsFeatures", [...currentStatsFeatures]);
            }
        }
    }
}
