import dayjs from "dayjs";

const mutations = {
    /**
     * Sets the visitor types, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setVisitorTypes (state, payload) {
        const
            visitorTypesByTypeAndYearComplete = {},
            visitorTypesByTypeAndYear = {},
            visitorTypesByDate = {};

        // Group by date
        payload.forEach(item => {

            item.sum_num_visitors_origin = item.sum_num_visitors;
            item.sum_num_visitors = Math.ceil(item.sum_num_visitors / 100) * 100;

            // Grouped by date
            if (!visitorTypesByDate[item.date]) {
                visitorTypesByDate[item.date] = [];
            }
            visitorTypesByDate[item.date].push(item);
        });

        // Prepare "grouped by visitor type and year"
        payload.forEach(item => {

            const year = dayjs(item.date).format("YYYY");
            let type = item.VisitorType;

            // These types are both consolidated as tourists
            if (["Tagestouristen", "Übernachtungstouristen"].includes(type)) {
                type = "Touristen";
            }

            if (!visitorTypesByTypeAndYearComplete[type]) {
                visitorTypesByTypeAndYearComplete[type] = {};
            }

            if (!visitorTypesByTypeAndYearComplete[type][year]) {
                visitorTypesByTypeAndYearComplete[type][year] = [];
            }

            visitorTypesByTypeAndYearComplete[type][year].push(item);

        });

        // Sum "grouped by visitor type and year" (daily)
        // Example: {"Touristen": {"2021": 12344, "2022": 4321}, "Pendler": { ... }}
        Object.keys(visitorTypesByTypeAndYearComplete).forEach(type => {
            Object.keys(visitorTypesByTypeAndYearComplete[type]).forEach(year => {

                if (!visitorTypesByTypeAndYear[type]) {
                    visitorTypesByTypeAndYear[type] = {};
                }
                if (!visitorTypesByTypeAndYear[type][year]) {
                    visitorTypesByTypeAndYear[type][year] = 0;
                }
                const sum = visitorTypesByTypeAndYearComplete[type][year].reduce((acc, value) => {
                    return acc + value.sum_num_visitors_origin;
                }, 0);

                visitorTypesByTypeAndYear[type][year] = Math.ceil(sum / 7);
            });
        });

        state.visitorTypesByDate = visitorTypesByDate;
        state.visitorTypesByTypeAndYear = visitorTypesByTypeAndYear;
    }

};

export default mutations;
