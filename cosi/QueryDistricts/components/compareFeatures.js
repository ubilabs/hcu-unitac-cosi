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
            let intersection = [],
                comparableFeatures = [];

            for (const layerFilter of layerFilterList) {
                if (layerFilter.filter !== "") {
                    features.push(await this.getAllFeaturesByAttribute({
                        id: layerFilter.layerId
                    }));
                }
            }

            if (features.length > 0) {
                layerFilterList.forEach(layerFilter => {
                    if (layerFilter.filter !== "" && layerFilter.districtInfo.length > 0) {
                        resultNames.push(this.filterOne(layerFilter, features[0]).map(feature => feature.getProperties()[selector]));
                        results.push(this.filterOne(layerFilter, features[0]));
                    }

                }, this);
                comparableFeatures = results[0];
                if (results.length > 1) {
                    intersection = resultNames.reduce(function (a, b) {
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
        let intersection = [];
        const filterResults = [],
            filterCollection = layerFilter.filter;
        
        Object.keys(filterCollection).forEach(filterKey => {
            const tolerance = [parseFloat(filterCollection[filterKey][0]), parseFloat(filterCollection[filterKey][1])],
                refValue = layerFilter.districtInfo.filter(item => item.key === filterKey)[0].value,
                selectedFeatures = features.filter(feature => {
                    return feature.getProperties()[filterKey] >= refValue - tolerance[0]
                        && feature.getProperties()[filterKey] <= refValue + tolerance[1]
                        && feature.getProperties()[this.keyOfAttrNameStats] !== this.getSelectedDistrict()
                        && feature.getProperties()[this.selectorField].indexOf(this.keyOfAttrNameStats) !== -1;
                });

            filterResults.push(selectedFeatures);
        }, this);
        if (filterResults.length > 1) {
            intersection = filterResults.reduce(function (a, b) {
                return a.filter(function (val) {
                    return b.includes(val);
                });
            });
            return intersection;
        }
        return filterResults[0];
    }
};
