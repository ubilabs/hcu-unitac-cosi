export default {
    /**
     * calculates comparable features
     * @param {Array} layerFilterList value
     * @returns {Array} comparable features results
     */
    setComparableFeatures: async function (layerFilterList) {

        const allFeatures = [];

        for (const layerFilter of layerFilterList) {
            const features = await this.getAllFeaturesByAttribute({
                id: layerFilter.layerId
            }).filter(feature => feature.getProperties()[layerFilter.field] >= layerFilter.value - layerFilter.low
                && feature.getProperties()[layerFilter.field] <= layerFilter.value + layerFilter.high
                && feature.getProperties()[this.keyOfAttrNameStats] !== this.selectedDistrict
                && feature.getProperties()[this.selectorField].indexOf(this.keyOfAttrNameStats) !== -1);

            allFeatures.push(features);
        }

        // eslint-disable-next-line one-var
        const intersection = allFeatures.reduce((a, b) => a.filter(
            x => b.find(y => y.getProperties()[this.keyOfAttrNameStats]
            === x.getProperties()[this.keyOfAttrNameStats])));

        return {
            resultNames: intersection.map(feature => feature.getProperties()[this.keyOfAttrNameStats]),
            features: intersection
        };
    }

};
