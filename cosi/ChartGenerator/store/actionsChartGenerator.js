const actions = {
    async channelGraphData ({commit, getters}, dataSet) {
        console.log(getters);
        console.log(dataSet);
        if (Array.isArray(dataSet)) {
            commit("setDataSets", [...getters.dataSets, ...dataSet]);
        }
        else {
            commit("setDataSets", [...getters.dataSets, dataSet]);
        }
    }
};

export default actions;
