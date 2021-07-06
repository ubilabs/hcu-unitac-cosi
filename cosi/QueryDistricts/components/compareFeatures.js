export default {
    /**
     * calculates comparable features
     * @param {String} value layerFilterList value
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     * @returns {void}
     */
    setComparableFeatures: async function (value) {
        if (value.length > 0) {
            const layerFilterList = value,
                selector = this.keyOfAttrNameStats,
                results = [],
                resultNames = [],
                features = [];

            let comparableFeatures = [];

            for (const layerFilter of layerFilterList) {
                features.push(await this.getAllFeaturesByAttribute({
                    id: layerFilter.layerId
                }));
            }

            if (features.length > 0) {
                layerFilterList.forEach(layerFilter => {
                    const ret = this.filterOne(layerFilter, features[0]);

                    resultNames.push(ret.map(feature => feature.getProperties()[selector]));
                    results.push(ret);

                }, this);
                comparableFeatures = results[0];
                if (results.length > 1) {
                    const intersection = resultNames.reduce(function (a, b) {
                        return a.filter(function (val) {
                            return b.includes(val);
                        });
                    });

                    comparableFeatures = results[0].filter(feature => intersection.includes(feature.getProperties()[selector]));
                    // this.comparableFeaturesNames = intersection;
                    // this.renderCompareResults(intersection);
                    // this.renderParams();
                    // console.log("c", comparableFeatures)
                    // return {comparableFeatures, intersection};
                    return {resultNames: intersection};
                }
                // else {
                // this.renderCompareResults(resultNames.reduce((acc, val) => acc.concat(val), [])); // arr.reduce((acc, val) => acc.concat(val), []) serves same function as arr.flat()
                // this.renderParams();
                // this.comparableFeaturesNames = resultNames.reduce((acc, val) => acc.concat(val), []); // arr.reduce((acc, val) => acc.concat(val), []) serves same function as arr.flat()
                return {resultNames: resultNames.reduce((acc, val) => acc.concat(val), [])};
                // }
                // this.showComparableDistricts(comparableFeatures);
            }
        }
        return null;
        // this.$el.find("#compare-results").empty();
        // this.$el.find("#params").empty();
        // this.$el.find("#show-in-dashboard").hide();
        // this.$el.find("#set-selected-district").hide();
        // this.clearMapLayer();
    },

    /**
     * runs all districts through one layerFilter
     * @param {Object} layerFilter the layerFilter to filter through
     * @param {Object[]} features -
     * @fires FeaturesLoader#RadioRequestGetAllFeaturesByAttribute
     * @fires Tools.SelectDistrict#RadioTriggerSelectDistrictGetSelector
     * @returns {Array} filter results
     */
    filterOne: function (layerFilter, features) {
        const tolerance = [layerFilter.low, layerFilter.high],
            refValue = layerFilter.value;

        return features.filter(feature => {
            return feature.getProperties()[layerFilter.field] >= refValue - tolerance[0]
                        && feature.getProperties()[layerFilter.field] <= refValue + tolerance[1]
                        && feature.getProperties()[this.keyOfAttrNameStats] !== this.getSelectedDistrict()
                        && feature.getProperties()[this.selectorField].indexOf(this.keyOfAttrNameStats) !== -1;
        });
    }
};
