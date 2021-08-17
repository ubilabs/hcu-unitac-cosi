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
                    .filter(props => props[layerFilter.field] >= layerFilter.value - layerFilter.low
                    && props[layerFilter.field] <= layerFilter.value + layerFilter.high
                    && props[this.keyOfAttrNameStats] !== this.selectedDistrict
                    && props[this.selectorField].indexOf(this.keyOfAttrNameStats) !== -1);

            }),
            intersection = allFeatures.reduce((a, b) => a.filter(
                x => b.find(y => y[this.keyOfAttrNameStats]
                    === x[this.keyOfAttrNameStats]))),

            resultNames = intersection.map(p => p[this.keyOfAttrNameStats])
                .sort().filter((x, i, a) => !i || x !== a[i - 1]), // sort and without duplicates
            resultProps = resultNames.map(n => intersection.find(f => f[this.keyOfAttrNameStats] === n)),
            table = resultProps.map(p => ({"name": p[this.keyOfAttrNameStats], ...layerFilterList.map(l => p[l.field])}));

        return {
            resultNames,
            features: resultProps.map(r=>r.feature),
            table
        };
    }
};
