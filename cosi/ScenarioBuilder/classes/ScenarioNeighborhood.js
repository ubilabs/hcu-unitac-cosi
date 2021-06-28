import {intersect} from "../../utils/geomUtils";
import store from "../../../../src/app-store";
import storeOriginalDistrictStats from "../utils/storeOriginalDistrictStats";
import getAvailableYears from "../../utils/getAvailableYears";

/**
 * Gets the percentage of feature1 within feature2
 * @param {module:ol/Feature} feature1 - a polygonal feature
 * @param {module:ol/Feature} feature2 - a polygonal feature
 * @return {number} - the percentage as float
 */
function getIntersection (feature1, feature2) {
    const crs = store.getters["Map/projectionCode"],
        intersection = intersect(
            [feature1, feature2],
            true,
            true,
            crs
        ),
        originalArea = feature1.getGeometry().getArea(),
        intersectionArea = intersection?.getGeometry().getArea() || 0,
        coverage = intersectionArea / originalArea;

    return coverage;
}

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

        this.districts = districts.map(district => {
            storeOriginalDistrictStats(district);

            return {coverage: getIntersection(feature, district), feature: district};
        });
    }

    /**
     * Renders the feature to the map and tags it if a guidelayer is provided
     * @todo store tag on the class?
     * @param {module:ol/layer/Vector} guideLayer - the guideLayer to draw tags to
     * @returns {void}
     */
    renderFeature () {
        this.modifyDistrictStats();

        this.layer.getSource().addFeature(this.feature);
    }

    /**
     * removes the feature and the tag from the map
     * @todo remove tag directly without searching the guideLayer
     * @returns {void}
     */
    hideFeature () {
        this.resetDistrictStats();

        this.layer.getSource().removeFeature(this.feature);
    }

    /**
     * @returns {void}
     */
    modifyDistrictStats () {
        for (const district of this.districts) {
            console.log(this.feature.get("stats"));
            console.log(district);
            console.log(district.feature.get("stats"));
            console.log(district.coverage);

            const years = getAvailableYears(district.feature.get("stats"));
            let year, originalVal;

            for (const datum of this.feature.get("stats")) {
                /**
                 * @todo IT'S JUST A PROTOTYPE
                 */
                if (datum.valueType === "absolute") {
                    const districtDatum = district.feature.get("stats").find(d => d.get("kategorie") === datum.category);

                    for (year of years) {
                        originalVal = parseFloat(districtDatum.get("jahr_" + year)) || 0;
                        districtDatum.set("jahr_" + year, originalVal + Math.round(datum.value * district.coverage));
                    }
                }
            }

            console.log(district.feature.get("stats"));
            console.log(store.getters["Tools/DistrictLoader/districtLevels"]);
        }
    }

    /**
     * @returns {void}
     */
    resetDistrictStats () {

    }
}
