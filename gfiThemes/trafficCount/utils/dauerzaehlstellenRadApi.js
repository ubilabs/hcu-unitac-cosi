import moment from "moment";

/**
 * the internal format for Gurlitt time is called GurlittMoment
 * @typedef {Object} GurlittMoment
 * @property {Number} result the result/value of this moment as number
 * @property {moment} momentStart the moment representation of the start time (moment object)
 * @property {moment} momentEnd the moment representation of the end time (moment object)
 */

/**
 * DauerzaehlstellenRadApi is the api for the TrafficCount GFI Theme with Gurlitt data source
 * <pre>
 * The DauerzaehlstellenRadApi uses the given feature to mock the TrafficCountApi to use the TrafficCount GFI Theme for Gurlitt
 * </pre>
 * @class
 * @memberof Tools.GFI.Themes.TrafficCount
 */
export class DauerzaehlstellenRadApi {

    /**
     * constructor of DauerzaehlstellenRadApi
     * @param {Object} feature the feature to use
     * @param {Function} [onerror] the fucntion to call in case of an error
     * @constructor
     * @returns {void}
     */
    constructor (feature, onerror) {
        this.feature = feature;
        this.gurlittMomentsYear = [];
        this.gurlittMomentsWeek = [];
        this.gurlittMomentsDay = [];

        if (this.featureExists()) {
            this.gurlittMomentsYear = this.convertGurlittTimeLineToPhenomeonMoment(feature.getProperties().jahrgangslinie);
            this.gurlittMomentsWeek = this.convertGurlittTimeLineToPhenomeonMoment(feature.getProperties().wochenlinie);
            this.gurlittMomentsDay = this.convertGurlittTimeLineToPhenomeonMoment(feature.getProperties().tageslinie);
        }
        else if (typeof onerror === "function") {
            onerror("DauerzaehlstellenRadApi.constructor: the feature to use has an unexpected structure", this.feature);
        }
    }

    /**
     * checks if this.feature is save to use
     * @returns {Boolean} true if this.feature is save to use, false if not
     */
    featureExists () {
        return typeof this.feature === "object" && this.feature !== null
            && typeof this.feature.getProperties === "function"
            && typeof this.feature.getId === "function";
    }

    /**
     * returns the id to use outside for referencing any function of DauerzaehlstellenRadApi
     * @param {Function} [onerror] the fucntion to call in case of an error
     * @returns {String|Boolean} the id to use or false if no feature is available (in which case onerror is called too)
     */
    getThingId (onerror) {
        if (this.featureExists()) {
            return this.feature.getId();
        }
        else if (typeof onerror === "function") {
            onerror("DauerzaehlstellenRadApi.getThingId: the feature to use has an unexpected structure", this.feature);
        }
        return false;
    }

    /**
     * returns the means of transport to use for all functions outside DauerzaehlstellenRadApi
     * you should give meansOfTransport in any function of DauerzaehlstellenRadApi to get results
     * @returns {String} the meansOfTransport
     */
    getMeansOfTransport () {
        return "Anzahl_Fahrraeder";
    }

    /**
     * gets the title of the thing
     * @param {Integer} thingId the ID of the thing
     * @param {Function} [onupdate] as function(title) to set the title with
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateTitle (thingId, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (!this.featureExists()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateTitle: the feature to use has an unexpected structure", this.feature);
            }
        }
        else if (thingId === this.getThingId()) {
            onupdate(this.feature.getProperties().name);
        }
        else if (typeof onerror === "function") {
            onerror("DauerzaehlstellenRadApi.updateTitle: the given thingId is not the one received by the api via api.getThingId()", thingId);
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the direction of the thing
     * @param {Integer} thingId the ID of the thing
     * @param {Function} [onupdate] as function(direction) to set the direction
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateDirection (thingId, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (thingId === this.getThingId()) {
            onupdate(i18next.t("additional:modules.tools.gfi.themes.trafficCount.directionBoth"));
        }
        else if (typeof onerror === "function") {
            onerror("DauerzaehlstellenRadApi.updateDirection: the given thingId is not the one received by the api via api.getThingId()", thingId);
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the sum for a single day - in this case gets always the data for the last day
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} day the day as String in format YYYY-MM-DD
     * @param {Function} [onupdate] as event function(date, value) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateDay (thingId, meansOfTransport, day, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (!this.featureExists()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateDay: the feature to use has an unexpected structure", this.feature);
            }
        }
        else if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateDay: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else if (typeof this.feature.getProperties().radfahrende_vortag !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateDay: the feature property radfahrende_vortag is missing or was ill received", this.feature.getProperties().radfahrende_vortag);
            }
        }
        else {
            // e.g. "18.07.2021|6310"
            const parts = this.feature.getProperties().radfahrende_vortag.split("|");

            onupdate(moment(parts[0], "DD.MM.YYYY").format("YYYY-MM-DD"), parseInt(parts[1], 10));
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the sum of a year - in this case gets the current year or the last year
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} year the year as String in format YYYY
     * @param {Function} onupdate as event function(year, value) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @param {String} [yearTodayOpt=NOW] as a String marking todays year in format YYYY; if left false, todays year is set automatically
     * @returns {void}
     */
    updateYear (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete, yearTodayOpt) {
        const todaysYear = yearTodayOpt || moment().format("YYYY");

        if (typeof onstart === "function") {
            onstart();
        }

        if (!this.featureExists()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateYear: the feature to use has an unexpected structure", this.feature);
            }
        }
        else if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateYear: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else if (typeof this.feature.getProperties().radfahrende_vorjahr !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateYear: the feature property radfahrende_vorjahr is missing or was ill received", this.feature.getProperties().radfahrende_vorjahr);
            }
        }
        else if (typeof this.feature.getProperties().radfahrende_seit_jahresbeginn !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateYear: the feature property radfahrende_seit_jahresbeginn is missing or was ill received", this.feature.getProperties().radfahrende_seit_jahresbeginn);
            }
        }
        else if (year === todaysYear) {
            // e.g. "01.01.2021|1069093"
            const parts = this.feature.getProperties().radfahrende_seit_jahresbeginn.split("|");

            onupdate(moment(parts[0], "DD.MM.YYYY").format("YYYY"), parseInt(parts[1], 10));
        }
        else {
            // e.g. "2020|2367656"
            const parts = this.feature.getProperties().radfahrende_vorjahr.split("|");

            onupdate(parts[0], parseInt(parts[1], 10));
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the total sum
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {Function} onupdate as event function(firstDate, value) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateTotal (thingId, meansOfTransport, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (!this.featureExists()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateTotal: the feature to use has an unexpected structure", this.feature);
            }
        }
        else if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateTotal: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else if (typeof this.feature.getProperties().radfahrende_insgesamt !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateTotal: the feature property radfahrende_insgesamt is missing or was ill received", this.feature.getProperties().radfahrende_insgesamt);
            }
        }
        else {
            // e.g. "08.10.2014|14636033"
            const parts = this.feature.getProperties().radfahrende_insgesamt.split("|");

            onupdate(moment(parts[0], "DD.MM.YYYY").format("YYYY-MM-DD"), parseInt(parts[1], 10));
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the strongest day in the given year excluding today
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} year the year as String in format YYYY
     * @param {Function} onupdate as event function(date, value)
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateHighestWorkloadDay (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (!this.featureExists()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadDay: the feature to use has an unexpected structure", this.feature);
            }
        }
        else if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadDay: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else if (typeof this.feature.getProperties().max_radfahrende_tag_jahr !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadDay: the feature property max_radfahrende_tag_jahr is missing or was ill received", this.feature.getProperties().max_radfahrende_tag_jahr);
            }
        }
        else {
            // e.g. "09.06.2021|12225"
            const parts = this.feature.getProperties().max_radfahrende_tag_jahr.split("|");

            onupdate(moment(parts[0], "DD.MM.YYYY").format("YYYY-MM-DD"), parseInt(parts[1], 10));
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the strongest week in the given year excluding the current week
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} year the year as String in format YYYY
     * @param {Function} onupdate as event function(calendarWeek, value)
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateHighestWorkloadWeek (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (!this.featureExists()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadWeek: the feature to use has an unexpected structure", this.feature);
            }
        }
        else if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadWeek: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else if (typeof this.feature.getProperties().max_radfahrende_woche_jahr !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadWeek: the feature property max_radfahrende_woche_jahr is missing or was ill received", this.feature.getProperties().max_radfahrende_woche_jahr);
            }
        }
        else {
            // e.g. "22|67640"
            const parts = this.feature.getProperties().max_radfahrende_woche_jahr.split("|");

            onupdate(parts[0], parseInt(parts[1], 10));
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the strongest month in the given year including the current month
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} year the year as String in format YYYY
     * @param {Function} onupdate as event function(month, value)
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateHighestWorkloadMonth (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (!this.featureExists()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadMonth: the feature to use has an unexpected structure", this.feature);
            }
        }
        else if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadMonth: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else if (typeof this.feature.getProperties().max_radfahrende_monat_jahr !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateHighestWorkloadMonth: the feature property max_radfahrende_monat_jahr is missing or was ill received", this.feature.getProperties().max_radfahrende_monat_jahr);
            }
        }
        else {
            // e.g. "06|269544"
            const parts = this.feature.getProperties().max_radfahrende_monat_jahr.split("|");

            onupdate(moment(parts[0], "MM").format("MMMM"), parseInt(parts[1], 10));
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * gets the data for a diagram or table for the given interval
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} timeSettings configuration
     * @param {String} timeSettings.interval the interval to call as '15-Min', '1-Stunde' or '1-Woche'
     * @param {String} timeSettings.from the day to start from (inclusive) as String in format YYYY-MM-DD
     * @param {String} timeSettings.until the day to end with (inclusive) as String in format YYYY-MM-DD
     * @param {Function} onupdate as event function(data) fires initialy and anytime server site changes are made; with data as object {meansOfTransport: {date: value}}
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateDataset (thingId, meansOfTransport, timeSettings, onupdate, onerror, onstart, oncomplete) {
        const result = [],
            timeSettingsList = Array.isArray(timeSettings) ? timeSettings : [timeSettings];

        if (typeof onstart === "function") {
            onstart();
        }

        if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.updateDataset: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else {
            timeSettingsList.forEach(timeSet => {
                const subresult = {};

                subresult[meansOfTransport] = {};

                if (typeof timeSet !== "object" || timeSet === null || typeof timeSet.interval !== "string" || typeof timeSet.from !== "string" || typeof timeSet.until !== "string") {
                    if (typeof onerror === "function") {
                        onerror("DauerzaehlstellenRadApi.updateDataset: the given timeSettings contain a timeSet with an unexpected format", timeSettings);
                    }
                }
                else if (timeSet.interval === "15-Min") {
                    // call for day
                    this.gurlittMomentsDay.forEach(gurlittMoment => {
                        if (gurlittMoment.momentStart.format("YYYY-MM-DD") === timeSet.from) {
                            subresult[meansOfTransport][gurlittMoment.momentStart.format("YYYY-MM-DD HH:mm:ss")] = gurlittMoment.result;
                        }
                    });
                }
                else if (timeSet.interval === "1-Tag") {
                    // call for week
                    this.gurlittMomentsWeek.forEach(gurlittMoment => {
                        if (moment(gurlittMoment.momentStart).startOf("isoWeek").format("YYYY-MM-DD") === timeSet.from) {
                            subresult[meansOfTransport][gurlittMoment.momentStart.format("YYYY-MM-DD HH:mm:ss")] = gurlittMoment.result;
                        }
                    });
                }
                else if (timeSet.interval === "1-Woche") {
                    // call for year
                    this.gurlittMomentsYear.forEach(gurlittMoment => {
                        // subtract 3 days to savely include the first thursday of january into the interval, as the first calendar week always includes the first thursday of january
                        if (moment(gurlittMoment.momentStart).startOf("year").subtract(3, "days").format("YYYY-MM-DD") === timeSet.from) {
                            subresult[meansOfTransport][gurlittMoment.momentStart.format("YYYY-MM-DD HH:mm:ss")] = gurlittMoment.result;
                        }
                        else if (moment(gurlittMoment.momentEnd).format("YYYY-MM-DD") === timeSet.until) {
                            subresult[meansOfTransport][gurlittMoment.momentStart.format("YYYY-MM-DD HH:mm:ss")] = gurlittMoment.result;
                        }
                    });
                }
                else if (typeof onerror === "function") {
                    onerror("DauerzaehlstellenRadApi.updateDataset: unexpected interval", timeSet);
                }

                result.push(subresult);
            });
            onupdate(result);
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * "subscribes the last change of data" - in this case returns the last value of tageslinie as date of last change
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {Function} [onupdate] as event function(phenomenonTime) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    subscribeLastUpdate (thingId, meansOfTransport, onupdate, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.subscribeLastUpdate: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
        }
        else if (!Array.isArray(this.gurlittMomentsDay) || this.gurlittMomentsDay.length === 0) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.subscribeLastUpdate: there is no data for day data to base the last update on", this.gurlittMomentsDay);
            }
        }
        else {
            const lastGurlittMomentDay = this.gurlittMomentsDay[this.gurlittMomentsDay.length - 1];

            onupdate(moment(lastGurlittMomentDay.momentEnd).format("YYYY-MM-DDTHH:mm:ss.000Z"));
        }

        if (typeof oncomplete === "function") {
            oncomplete();
        }
    }

    /**
     * unsubscribe all subscriptions that have been made so far by any function of this api
     * @param {Function} [onsuccess] an event function() to fire when all subscriptions have been successfully canceled
     * @returns {void}
     */
    unsubscribeEverything (onsuccess) {
        if (typeof onsuccess === "function") {
            onsuccess();
        }
    }

    /**
     * gets the title and the data without subscription for the given thingId, meansOfTransport and timeSettings
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} timeSettings time configuration
     * @param {String} timeSettings.interval the interval to call as '15-Min', '1-Stunde' or '1-Woche'
     * @param {String} timeSettings.from the day to start from (inclusive) as String in format YYYY-MM-DD
     * @param {String} timeSettings.until the day to end with (inclusive) as String in format YYYY-MM-DD
     * @param {Function} onsuccess as event function(result) with result{title, dataset} and dataset{meansOfTransport: {date: value}}; fired once on success (no subscription)
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    downloadData (thingId, meansOfTransport, timeSettings, onsuccess, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }
        if (thingId !== this.getThingId()) {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.downloadData: the given thingId is not the one received by the api via api.getThingId()", thingId);
            }
            if (typeof oncomplete === "function") {
                oncomplete();
            }
            return;
        }
        else if (typeof timeSettings !== "object" || timeSettings === null || typeof timeSettings.interval !== "string") {
            if (typeof onerror === "function") {
                onerror("DauerzaehlstellenRadApi.downloadData: the given timeSettings contain a timeSet with an unexpected format", timeSettings);
            }
            if (typeof oncomplete === "function") {
                oncomplete();
            }
            return;
        }

        this.updateTitle(thingId, title => {
            const data = {};

            data[meansOfTransport] = {};

            if (timeSettings.interval === "15-Min") {
                // call for day
                this.gurlittMomentsDay.forEach(gurlittMoment => {
                    data[meansOfTransport][gurlittMoment.momentStart.format("YYYY-MM-DD HH:mm:ss")] = gurlittMoment.result;
                });
            }
            else if (timeSettings.interval === "1-Tag") {
                // call for week
                this.gurlittMomentsWeek.forEach(gurlittMoment => {
                    data[meansOfTransport][gurlittMoment.momentStart.format("YYYY-MM-DD HH:mm:ss")] = gurlittMoment.result;
                });
            }
            else if (timeSettings.interval === "1-Woche") {
                // call for year
                this.gurlittMomentsYear.forEach(gurlittMoment => {
                    data[meansOfTransport][gurlittMoment.momentStart.format("YYYY-MM-DD HH:mm:ss")] = gurlittMoment.result;
                });
            }
            else {
                if (typeof onerror === "function") {
                    onerror("DauerzaehlstellenRadApi.updateDataset: unexpected interval", timeSettings);
                }
                if (typeof oncomplete === "function") {
                    oncomplete();
                }
                return;
            }

            if (typeof onsuccess === "function") {
                onsuccess({
                    title,
                    data
                });
            }
            if (typeof oncomplete === "function") {
                oncomplete();
            }
        }, onerror);
    }

    /**
     * gets the first date on a weekly basis ever recorded without subscription
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {Function} onsuccess as event function(firstDate) fires once
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    getFirstDateEver (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
        this.updateTotal(thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete);
    }

    /* private */
    /**
     * converts a piped string from Gurlitt data into an array of GurlittMoment
     * @param {String} gurlittTimeLine the Gurlitt time line as piped string of Gurlitt time
     * @returns {GurlittMoment[]} an array of GurlittMoment
     */
    convertGurlittTimeLineToPhenomeonMoment (gurlittTimeLine) {
        if (typeof gurlittTimeLine !== "string") {
            return [];
        }
        const parts = gurlittTimeLine.split("|"),
            result = [];

        parts.forEach(gurlittTime => {
            if (gurlittTime) {
                result.push(this.convertGurlittTimeToGurlittMoment(gurlittTime));
            }
        });
        return result;
    }

    /**
     * converts the data format of a Gurlitt time term into a GurlittMoment
     * @param {String} gurlittTime the Gurlitt time
     * @returns {GurlittMoment} the representation of a GurlittMoment
     */
    convertGurlittTimeToGurlittMoment (gurlittTime) {
        if (typeof gurlittTime !== "string") {
            return null;
        }
        const momentStart = this.getMomentStartByGurlittTime(gurlittTime),
            momentEnd = this.getMomentEndByMomentStart(gurlittTime, momentStart);

        return {
            result: this.getResultByGurlittTime(gurlittTime),
            momentStart,
            momentEnd
        };
    }

    /**
     * parses the given gurlittTime string and returns the found result
     * @param {String} gurlittTime the Gurlitt time
     * @returns {Number} the result als Number
     */
    getResultByGurlittTime (gurlittTime) {
        const indicator = gurlittTime.substr(0, 3),
            correctedGurlittTime = this.correctGurlittYearPattern(gurlittTime);

        if (indicator.indexOf(".") !== -1) {
            // e.g. day "18.07.2021,0:00:00,104"
            return parseInt(gurlittTime.substr(gurlittTime.lastIndexOf(",") + 1), 10);
        }
        else if (indicator.indexOf(",") !== -1) {
            // e.g. week "28,12.07.2021,8564"
            return parseInt(gurlittTime.substr(gurlittTime.lastIndexOf(",") + 1), 10);
        }
        // e.g. year "2021,-53,5873"
        return parseInt(correctedGurlittTime.substr(correctedGurlittTime.lastIndexOf(",") + 1), 10);
    }

    /**
     * parses the given gurlittTime string and returns the start date as moment representation
     * @param {String} gurlittTime the Gurlitt time
     * @returns {Function} the moment representation to work with
     */
    getMomentStartByGurlittTime (gurlittTime) {
        const indicator = gurlittTime.substr(0, 3),
            correctedGurlittTime = this.correctGurlittYearPattern(gurlittTime);

        if (indicator.indexOf(".") !== -1) {
            // e.g. day "18.07.2021,0:00:00,104"
            return moment(gurlittTime.substr(0, gurlittTime.lastIndexOf(",")), "DD.MM.YYYY,HH:mm:ss");
        }
        else if (indicator.indexOf(",") !== -1) {
            // e.g. week "28,12.07.2021,8564"
            return moment(gurlittTime.substr(gurlittTime.indexOf(",") + 1, gurlittTime.lastIndexOf(",")), "DD.MM.YYYY");
        }
        // e.g. year "2021,-53,5873"
        return moment(correctedGurlittTime.substr(0, correctedGurlittTime.lastIndexOf(",")), "YYYY,W").startOf("isoWeek");
    }

    /**
     * parses the given gurlittTime string and uses the given moment representation to return the end date as moment representation
     * @param {String} gurlittTime the Gurlitt time
     * @param {Function} momentStart the moment representation of the start date
     * @returns {Function} the moment representation to work with
     */
    getMomentEndByMomentStart (gurlittTime, momentStart) {
        const indicator = gurlittTime.substr(0, 3);

        if (indicator.indexOf(".") !== -1) {
            // e.g. day "18.07.2021,0:00:00,104"
            return moment(momentStart).add(1, "hours").subtract(1, "seconds");
        }
        else if (indicator.indexOf(",") !== -1) {
            // e.g. week "28,12.07.2021,8564"
            return moment(momentStart).add(1, "days").subtract(1, "seconds");
        }
        // e.g. year "2021,-53,5873"
        return moment(momentStart).endOf("week");
    }

    /**
     * corrects the Gurlitt data year pattern "YYYY,-W,R" into "YYYY-1,W,R"
     * the weeknumber can be negative. In this case we assume that a calendar week of the previous year is ment.
     * e.g. "2021,-53,..." -> means: KW53 of 2020
     * @param {String} gurlittTime the Gurlitt time
     * @returns {String} the corrected gurlittTime
     */
    correctGurlittYearPattern (gurlittTime) {
        if (typeof gurlittTime !== "string") {
            return "";
        }
        else if (gurlittTime.indexOf("-") === -1) {
            // nothing to do
            return gurlittTime;
        }
        const parts = gurlittTime.split(","),
            year = parseInt(parts[0], 10) - 1,
            weeknumber = Math.abs(parseInt(parts[1], 10));

        return String(year) + "," + String(weeknumber) + "," + parts[2];
    }
}
