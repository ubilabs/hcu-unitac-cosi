/**
 *
 * @param {*} newDataSets newDataSets
 * @return {void}
 */
function addDataSets ({commit, getters}, newDataSets) {
    const dataSets = [... getters.dataSets];

    for (const dataSet of newDataSets) {
        if (!dataSet.cgid) {
            dataSet.cgid = dataSet.id + "-" + dataSet.name;
        }

        const checkDouble = dataSets.find(x => x.cgid === dataSet.cgid);

        if (checkDouble) {
            const index = dataSets.indexOf(checkDouble);

            dataSets.splice(index, 1);
        }

        if (dataSet.target === "" || dataSet.target === undefined || dataSet.target === null) {
            commit("setActive", true);
        }

        if (Array.isArray(dataSet.type)) {
            if (!dataSet.sub_graph) {
                dataSet.sub_graph = 0;
            }
        }
        dataSets.push(dataSet);
    }
    commit("setDataSets", dataSets);
}

const actions = {
    async channelGraphData ({commit, getters}, dataSet) {
        if (Array.isArray(dataSet)) {
            addDataSets({commit, getters}, dataSet);
        }
        else {
            addDataSets({commit, getters}, [dataSet]);
        }
    }
};

export default actions;
