/**
 * @param {*} dataSet
 */
function prepareMultiple (dataSet) {
    const dataClone = JSON.parse(JSON.stringify(dataSet));

    dataSet.type.forEach((type, i) => {
        const typeData = {...dataClone};

        typeData.type = type;
        typeData.init = dataSet.init;
        typeData.sub = true;
        typeData.sub_index = i;
        typeData.sub_length = dataSet.type.length;
        typeData.sub_graph = 0;
    });
}

/**
 *
 * @param {*} newDataSets
 * @param {*} oldValue
 * @return {*}
 */
function addDataSets ({commit, getters}, newDataSets) {
    // console.log("newDataSet new", newDataSets);
    // console.log("newDataSet old", oldValue);
    // console.log("newDataSet new", newDataSets.length);
    for (const dataSet of newDataSets) {
        // if (oldValue && oldValue.indexOf(dataSet) >= 0) {
        //     continue;
        // }
        // if (dataSet === oldValue) {
        //     return;
        // }
        if (!dataSet.cgid) {
            dataSet.cgid = dataSet.id + "-" + dataSet.name;
        }
        // const checkDouble = this.dataSets.find(x => x.cgid === dataSet.cgid);

        // if (checkDouble) {
        //     const index = this.dataSets.indexOf(checkDouble);

        //     this.dataSets.splice(index, 1);
        //     dataSet.init = this.dataSets.length;
        // }
        // else {
        // }
        dataSet.init = getters.dataSets.length;

        if (dataSet.target === "" || dataSet.target === undefined || dataSet.target === null) {
            commit("setActive", true);
        }

        if (Array.isArray(dataSet.type)) {
            if (!dataSet.sub_graph) {
                dataSet.sub_graph = 0;
            }
            prepareMultiple(dataSet);
        }
    }
    commit("setDataSets", [...getters.dataSets, ...newDataSets]);
    // commit("setActiveGraph", this.dataSets.length - 1);
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
