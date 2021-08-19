import Vue from "vue";

const actions = {
    async channelGraphData ({commit}, dataSet) {
        if (Array.isArray(dataSet)) {
            dataSet.forEach(x => {
                Vue.nextTick(function () {
                    commit("setNewDataSet", x);
                });
            });
        }
        else {
            await Vue.nextTick();
            commit("setNewDataSet", dataSet);
        }

    }
};

export default actions;
