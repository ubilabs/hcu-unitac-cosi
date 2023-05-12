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
            newMonth.avg = Math.floor(month.avg);
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
            days = [],
            dayIndexTranslator = ["mo", "tu", "we", "th", "fr", "sa", "su"];

        dayly.forEach(day => {
            const newDay = {};

            newDay.index = day.weekday;
            newDay.avg = Math.floor(day.avg);
            days.push(newDay);
        });

        state.averageVisitorsPerDay = days.toSorted((a, b) => dayIndexTranslator.indexOf(a.index) - dayIndexTranslator.indexOf(b.index));
    },
    /**
     * Sets the rounded yearly data for unique visitors to the state, selected from WhatALocation data.
     * @param {Object} state the store's state object
     * @param {Object} payload data from WhatALocation endpoint
     * @returns {void}
     */
    setIndividualVisitorsPerYear (state, payload) {
        const yearly_average = payload?.unique?.best_year,
            individualVisitorsPerYear = yearly_average.map((element) => {
                element.avg = Math.floor(element.avg);
                element.sum = Math.floor(element.sum);

                return element;
            });

        state.individualVisitorsPerYear = individualVisitorsPerYear;
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
                geometry: feature.location.point,
                properties: {
                    street: feature.location.street,
                    id: feature.location.id,
                    avgVisitorsMonday: Math.floor(feature.avg_daily_visitors_isoweekday[1]),
                    avgVisitorsTuesday: Math.floor(feature.avg_daily_visitors_isoweekday[2]),
                    avgVisitorsWednesday: Math.floor(feature.avg_daily_visitors_isoweekday[3]),
                    avgVisitorsThursday: Math.floor(feature.avg_daily_visitors_isoweekday[4]),
                    avgVisitorsFriday: Math.floor(feature.avg_daily_visitors_isoweekday[5]),
                    avgVisitorsSaturday: Math.floor(feature.avg_daily_visitors_isoweekday[6]),
                    avgVisitorsSunday: Math.floor(feature.avg_daily_visitors_isoweekday[7]),
                    avgVisitorsJanuary: Math.floor(feature.avg_daily_visitors_per_month[1]),
                    avgVisitorsFebruary: Math.floor(feature.avg_daily_visitors_per_month[2]),
                    avgVisitorsMarch: Math.floor(feature.avg_daily_visitors_per_month[3]),
                    avgVisitorsApril: Math.floor(feature.avg_daily_visitors_per_month[4]),
                    avgVisitorsMay: Math.floor(feature.avg_daily_visitors_per_month[5]),
                    avgVisitorsJune: Math.floor(feature.avg_daily_visitors_per_month[6]),
                    avgVisitorsJuly: Math.floor(feature.avg_daily_visitors_per_month[7]),
                    avgVisitorsAugust: Math.floor(feature.avg_daily_visitors_per_month[8]),
                    avgVisitorsSeptember: Math.floor(feature.avg_daily_visitors_per_month[9]),
                    avgVisitorsOctober: Math.floor(feature.avg_daily_visitors_per_month[10]),
                    avgVisitorsNovember: Math.floor(feature.avg_daily_visitors_per_month[11]),
                    avgVisitorsDecember: Math.floor(feature.avg_daily_visitors_per_month[12])
                }
            };

            Object.keys(feature.avg_daily_visitors_per_year).forEach(year => {
                featureJSON.properties["avgVisitors" + year] = Math.floor(feature.avg_daily_visitors_per_year[year]);
            });

            geoJSON.features.push(featureJSON);

            allLocationsArray.push({
                id: feature.location.id,
                street: feature.location.street
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
