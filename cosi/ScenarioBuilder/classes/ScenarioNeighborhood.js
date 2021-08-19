// import storeOriginalDistrictStats from "../utils/storeOriginalDistrictStats";
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
            // storeOriginalDistrictStats(district);
            return {coverage: getIntersectionCoverage(feature, district.adminFeature), district: district};
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
     * @todo move to district methods?
     * @returns {void}
     */
    modifyDistrictStats () {
        for (const item of this.districts) {

            const years = getAvailableYears(item.district.statFeatures),
                completion = new Date(this.feature.get("year")).getFullYear();
            let year, originalVal;

            for (const datum of this.feature.get("stats")) {
                /**
                 * @todo IT'S JUST A PROTOTYPE
                 */
                if (datum.valueType === "absolute") {
                    const districtDatum = item.district.statFeatures.find(d => d.get("kategorie") === datum.category);

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
