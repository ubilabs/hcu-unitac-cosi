import getCompareData from "../../../../utils/getCompareData";

const getters = {
    /**
     * Generates the data array for the bar chart for lcoation a and date a
     * @param {Object} dwellTimeLocationA dwellTimeDateA state
     * @return {Object} data Object for bar chart
     */
    getDwellTimeLocationA: ({dwellTimeLocationA}) => {
        return getCompareData.getCompareData(dwellTimeLocationA, "Dwell Time Location A", "#FD763B", "Verweildauer");
    }
};

export default getters;
