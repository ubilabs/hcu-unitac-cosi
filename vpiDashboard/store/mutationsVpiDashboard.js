import {generateSimpleMutations} from "../../../src/app-store/utils/generators";
import stateVpiDashboard from "./stateVpiDashboard";

const mutations = {
    ...generateSimpleMutations(stateVpiDashboard),

    /**
     * Sets the rounded monthly data for unique visitors to the state, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setAverageVisitorsPerMonth (state, payload) {
        const monthly = payload.unique?.monthly,
            months = [];

        monthly.forEach(month => {
            const newMonth = {};

            newMonth.index = month.date__month - 1;
            newMonth.avg = Math.round(month.avg);
            months.push(newMonth);
        });
        months.sort((a, b) => a.index - b.index);
        state.averageVisitorsPerMonth = months;
    },
    /**
    * Sets the rounded daily data for unique visitors to the state, selected from WhatALocation data.
    * @param {Object} state the store's state object
    * @param {Object} payload data from WhatALocation endpoint
    * @returns {void}
    */
    setAverageVisitorsPerDay (state, payload) {
        const dayly = payload.unique?.dayly,
            days = [];

        dayly.forEach(day => {
            const newDay = {};

            newDay.index = day.weekday;
            newDay.avg = Math.round(day.avg);
            days.push(newDay);
        });
        state.averageVisitorsPerDay = days;
    },
    /**
     * Sets the rounded yearly data for unique visitors to the state, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setIndividualVisitorsPerYear (state, payload) {
        const split_yearly = payload?.unique?.split_yearly,
            individualVisitorsPerYear = split_yearly.reduce((n, {avg}) => n + avg, 0);

        state.individualVisitorsPerYear = Math.round(individualVisitorsPerYear);
    },

    /**
     * Generate a GeoJson for all WhatALocation Locations.
     * @param {object} state of this component
     * @param {Array} payload Array of all locations from WhatALocation endpoint
     * @returns {void}
     */
    setAllLocationsGeoJson (state, payload) {
        const geoJSON = {
                type: "FeatureCollection",
                crs: {
                    type: "link",
                    properties: {
                        href: "http://spatialreference.org/ref/epsg/4326/proj4/",
                        type: "proj4"
                    }
                },
                features: []
            },

            allLocationsArray = [];

        let featureJSON;

        payload.forEach(feature => {
            featureJSON = {
                type: "Feature",
                geometry: feature.point,
                properties: {
                    id: feature.id,
                    street: feature.street
                }
            };
            geoJSON.features.push(featureJSON);

            allLocationsArray.push({
                id: feature.id,
                street: feature.street
            });
        });

        geoJSON.styles = [
            {
                styleId: "customLayer",
                rules: [
                    {
                        style: {
                            circleStrokeColor: [
                                255,
                                0,
                                0,
                                1
                            ],
                            circleFillColor: [
                                255,
                                0,
                                0,
                                0.5
                            ]
                        }
                    }
                ]
            }
        ];

        state.allLocationsGeoJson = geoJSON;
        state.allLocationsArray = allLocationsArray;
    }

};

export default mutations;
