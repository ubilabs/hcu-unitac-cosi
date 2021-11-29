const actions = {
    async channelGraphData ({commit}, dataSet) {
        if (Array.isArray(dataSet)) {
            dataSet.forEach(x => {
                setTimeout(function () {
                    commit("setNewDataSet", x);
                }, 500);
            });
        }
        else {
            setTimeout(function () {
                commit("setNewDataSet", dataSet);
            }, 500);
        }
    }
};

export default actions;
