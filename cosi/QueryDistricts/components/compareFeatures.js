export default {
    /**
     * calculates comparable features
     * @param {Array} layerFilterList value
     * @returns {Array} comparable features results
     */
    setComparableFeatures: async function (layerFilterList) {
        const allFeatures = layerFilterList.map(layerFilter => {

                const id = layerFilter.quotientLayer ?
                    `${layerFilter.layerId}/${layerFilter.quotientLayer}` : layerFilter.layerId;

                return this.propertiesMap[id]
                    .filter(feature => feature[layerFilter.field] >= layerFilter.value - layerFilter.low
                    && feature[layerFilter.field] <= layerFilter.value + layerFilter.high
                    && feature[this.keyOfAttrNameStats] !== this.selectedDistrict
                    && feature[this.selectorField].indexOf(this.keyOfAttrNameStats) !== -1);

            }),
            intersection = allFeatures.reduce((a, b) => a.filter(
                x => b.find(y => y[this.keyOfAttrNameStats]
                    === x[this.keyOfAttrNameStats]))),

            resultNames = intersection.map(f => f[this.keyOfAttrNameStats])
                .sort().filter((x, i, a) => !i || x !== a[i - 1]); // sort and without duplicates

        return {
            resultNames,
            features: resultNames.map(n => intersection.find(f => f[this.keyOfAttrNameStats] === n).feature)
        };
    }
};
