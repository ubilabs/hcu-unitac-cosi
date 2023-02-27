import {SensorThingsHttp} from "../../../../src/utils/sensorThingsHttp.js";
import {SensorThingsMqtt} from "../../../../src/utils/sensorThingsMqtt.js";
import {getPublicHoliday} from "../../../../src/utils/calendar.js";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

// change language from day.js to german
require("dayjs/locale/de.js");
dayjs.locale("de");

/**
 * TrafficCountApi is the api for the TrafficCount GFI Theme
 * <pre>
 * The TrafficCountApi uses SensorThingsHttp and SensorThingsMqtt to provide simple access to basic functions for the TrafficCount GFI Theme
 * Any subscription is handled by the TrafficCountApi.
 *
 * To import TrafficCountApi: import {TrafficCountApi} from "./trafficCountApi";
 * create a new object:        const obj = new TrafficCountApi(...);
 * remember to unsubscribe:    obj.unsubscribeEverything();
 * </pre>
 * @class
 * @memberof Tools.GFI.Themes.TrafficCount
 */
export class TrafficCountApi {

    /**
     * constructor of TrafficCountApi
     * @param {String} httpHost the host (incl. protocol) to call any http request with
     * @param {String} sensorThingsVersion the used version of the SensorThingsAPI (e.g. "v1.0")
     * @param {Object} [mqttOptions] the options to connect to mqtt with
     * @param {Object} [sensorThingsHttpOpt] an optional http client for testing
     * @param {Object} [sensorThingsMqttOpt] an optional mqtt client for testing
     * @param {Boolean} [noSingletonOpt=false] for testing only - set true to turn off singleton behavior for testing
     * @constructor
     * @returns {TrafficCountApi}  the instance of TrafficCountApi (singleton)
     */
    constructor (httpHost, sensorThingsVersion, mqttOptions, sensorThingsHttpOpt, sensorThingsMqttOpt, noSingletonOpt) {
        if (!noSingletonOpt) {
            // make this instance a multiton based on httpHost (one singleton for each unique host)
            if (typeof TrafficCountApi.instance !== "object" || TrafficCountApi.instance === null) {
                TrafficCountApi.instance = {};
            }

            if (Object.prototype.hasOwnProperty.call(TrafficCountApi.instance, httpHost)) {
                return TrafficCountApi.instance[httpHost];
            }

            TrafficCountApi.instance[httpHost] = this;
        }

        /** @private */
        this.sensorThingsVersion = sensorThingsVersion;
        /** @private */
        this.http = sensorThingsHttpOpt || new SensorThingsHttp({removeIotLinks: true});
        /** @private */
        this.mqttClient = sensorThingsMqttOpt || new SensorThingsMqtt(mqttOptions);
        /** @private */
        this.httpHost = httpHost;
        /** @private */
        this.baseUrlHttp = httpHost + "/" + this.sensorThingsVersion;
        /** @private */
        this.subscriptionTopics = {};
        /** @private */
        // this.layerNameInfix = "";
        // this.layerNameInfix = "_Zaehlfeld";
        this.layerNameInfix = "_Zaehlstelle";

        // set the mqtt listener
        if (this.mqttClient && typeof this.mqttClient.on === "function") {
            this.mqttClient.on("message", (topic, payload, packet) => {
                if (Object.prototype.hasOwnProperty.call(this.subscriptionTopics, topic)) {
                    if (!Array.isArray(this.subscriptionTopics[topic])) {
                        return;
                    }

                    this.subscriptionTopics[topic].forEach(callback => {
                        if (typeof callback !== "function") {
                            // continue
                            return;
                        }
                        callback(payload, packet);
                    });
                }
            });
        }
    }

    /**
     * the default function to call on error
     * @param {String[]} errorargs the error messages as array of Strings
     * @returns {Void}  -
     */
    defaultErrorHandler (...errorargs) {
        console.warn(errorargs);
    }

    /**
     * checks if the given dataset has a datastream with an id and an array of observations
     * @param {Object} dataset the dataset to check
     * @returns {Boolean}  true/false
     */
    checkForObservations (dataset) {
        return Array.isArray(dataset) && dataset.length > 0 && Object.prototype.hasOwnProperty.call(dataset[0], "Datastreams")
            && Array.isArray(dataset[0].Datastreams) && dataset[0].Datastreams.length > 0 && Object.prototype.hasOwnProperty.call(dataset[0].Datastreams[0], "@iot.id")
            && Array.isArray(dataset[0].Datastreams[0].Observations);
    }

    /**
     * sums up the observation results of the given structure
     * @param {Object} dataset the dataset to go through
     * @returns {Integer|Boolean}  the sum of all found observation results
     */
    sumObservations (dataset) {
        if (!this.checkForObservations(dataset)) {
            return false;
        }

        let sum = 0;

        dataset[0].Datastreams[0].Observations.forEach(observation => {
            if (!observation?.result) {
                // continue
                return;
            }

            sum += observation.result;
        });

        return sum;
    }

    /**
     * returns the oldest date as phenomenonTime of the given structure
     * @param {Object} dataset the dataset to go through
     * @param {String} [firstDateSoFar] the firstDate to account for the "firstest" so far, todays date if no firstDateSoFar is given
     * @returns {String|Boolean}  the first date as phenomenonTime (in format YYYY-MM-DDTHH:mm:ss.SSSZ) or false if no observations were found
     */
    getFirstDate (dataset, firstDateSoFar) {
        if (!this.checkForObservations(dataset)) {
            return false;
        }

        // set firstDate to today
        let firstDate = firstDateSoFar || dayjs().toISOString(),
            phenomenonTime = "";

        dataset[0].Datastreams[0].Observations.forEach(observation => {
            if (!observation?.phenomenonTime) {
                // continue
                return;
            }

            phenomenonTime = this.parsePhenomenonTime(observation.phenomenonTime);
            if (phenomenonTime < firstDate) {
                firstDate = phenomenonTime;
            }
        });

        return firstDate;
    }

    /**
     * checks a phenomenonTime for interval, if not phenomenonTime is returned, if so the first part of the interval is returned
     * @info phenomenonTime could be either "2020-03-16T14:30:01.000Z" or "2020-03-16T14:30:01.000Z/2020-03-16T14:45:00.000Z"
     * @param {String} phenomenonInterval the phenomenonTime either as value or interval (see info)
     * @returns {String} the phenomenonTime
     */
    parsePhenomenonTime (phenomenonInterval) {
        if (typeof phenomenonInterval !== "string") {
            return "";
        }

        const phenomenonArray = phenomenonInterval.split("/");

        // return the first part of the interval
        return phenomenonArray[0];
    }

    /**
     * subscribes to a topic
     * @param {String} topic the topic to subscribe to
     * @param {Object} options the options for the mqtt client
     * @param {callback} handler the event as function(payload) to be called when receiving new data
     * @returns {Void}  -
     */
    mqttSubscribe (topic, options, handler) {
        if (!Object.prototype.hasOwnProperty.call(this.subscriptionTopics, topic)) {
            // new subscription
            this.subscriptionTopics[topic] = [];
        }
        this.subscriptionTopics[topic].push(handler);

        if (this.mqttClient && typeof this.mqttClient.subscribe === "function") {
            this.mqttClient.subscribe(topic, options);
        }
    }

    /**
     * gets the title of the thing
     * @param {Integer} thingId the ID of the thing
     * @param {Function} [onupdate] as function(title) to set the title with
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    updateTitle (thingId, onupdate, onerror, onstart, oncomplete) {
        const url = this.baseUrlHttp + "/Things(" + thingId + ")";

        return this.http.get(url, (dataset) => {
            if (Array.isArray(dataset) && dataset.length > 0 && dataset[0]?.name) {
                if (typeof onupdate === "function") {
                    onupdate(dataset[0].name);
                }
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateTitle: the response does not include a Thing with a proper name", dataset);
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
    }

    /**
     * gets the direction of the thing
     * @param {Integer} thingId the ID of the thing
     * @param {Function} [onupdate] as function(direction) to set the direction
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    updateDirection (thingId, onupdate, onerror, onstart, oncomplete) {
        const url = this.baseUrlHttp + "/Things(" + thingId + ")";

        return this.http.get(url, (dataset) => {
            if (Array.isArray(dataset) && dataset.length > 0 && dataset[0]?.properties && dataset[0].properties?.richtung) {
                if (typeof onupdate === "function") {
                    onupdate(dataset[0].properties.richtung);
                }
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateDirection: the response does not include a Thing with a proper name", dataset);
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
    }

    /**
     * gets the sum for a single day excluding todays last 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} day the day as String in format YYYY-MM-DD
     * @param {Function} [onupdate] as event function(date, value) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @param {String} [dayTodayOpt=NOW] as a String marking todays date in format YYYY-MM-DD; if left false, today is set automatically
     * @returns {Void}  -
     */
    updateDay (thingId, meansOfTransport, day, onupdate, onerror, onstart, oncomplete, dayTodayOpt) {
        let sum = 0;
        const startDate = dayjs(day, "YYYY-MM-DD").toISOString(),
            endDate = dayjs(day, "YYYY-MM-DD").add(1, "day").toISOString(),
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_15-Min';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + "))";

        return this.http.get(url, (dataset) => {
            if (!this.checkForObservations(dataset)) {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateDay: the dataset does not include a datastream with an observation", dataset);
                return;
            }

            sum = this.sumObservations(dataset);

            if (typeof onupdate === "function") {
                onupdate(day, sum);
            }

            // if day equals dayToday: make a mqtt subscription to refresh sum
            if (day !== (dayTodayOpt || dayjs().format("YYYY-MM-DD"))) {
                return;
            }

            // subscribe via mqtt
            const datastreamId = dataset[0].Datastreams[0]["@iot.id"],
                topic = this.sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

            // set retain handling rh to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
            this.mqttSubscribe(topic, {rh: 2}, (payload, packet) => {
                if (packet && packet?.retain && packet.retain === true) {
                    // this message is a retained message, so its content is already in sum
                    return;
                }
                if (payload && payload?.result) {
                    sum += payload.result;

                    if (typeof onupdate === "function") {
                        onupdate(day, sum);
                    }
                }
                else {
                    (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateDay: the payload does not include a result", payload);
                }
            });
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
    }

    /**
     * gets the sum of a year excluding todays last 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} year the year as String in format YYYY
     * @param {Function} onupdate as event function(year, value) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @param {String} [yearTodayOpt=NOW] as a String marking todays year in format YYYY; if left false, todays year is set automatically
     * @returns {Void}  -
     */
    updateYear (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete, yearTodayOpt) {
        let sumYear = 0,
            sumThisDay = 0;
        const startDate = dayjs(year, "YYYY").toISOString(),
            endDate = dayjs(year, "YYYY").add(1, "year").toISOString(),
            lastMidnight = dayjs().startOf("day").toISOString(),
            yearToday = yearTodayOpt || dayjs().format("YYYY"),
            urlYear = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_1-Tag';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + (year === yearToday ? lastMidnight : endDate) + "))",
            urlThisDays15min = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_15-Min';$expand=Observations($filter=phenomenonTime ge " + lastMidnight + "))";

        return this.http.get(urlYear, (datasetYear) => {
            if (!this.checkForObservations(datasetYear)) {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateYear: datasetYear does not include a datastream with an observation", datasetYear);
                return;
            }

            sumYear = this.sumObservations(datasetYear);

            if (typeof onupdate === "function") {
                onupdate(year, sumYear);
            }


            if (year !== yearToday) {
                return;
            }

            // year eq todays year
            this.http.get(urlThisDays15min, (dataset15min) => {
                if (!this.checkForObservations(dataset15min)) {
                    (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateYear: dataset15min does not include a datastream with an observation", dataset15min);
                }

                sumThisDay = this.sumObservations(dataset15min);

                if (typeof onupdate === "function") {
                    onupdate(year, sumYear + sumThisDay);
                }

                // subscribe via mqtt
                const datastreamId = dataset15min[0].Datastreams[0]["@iot.id"],
                    topic = this.sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                // set retain to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
                this.mqttSubscribe(topic, {rh: 2}, (payload, packet) => {
                    if (packet && packet?.retain && packet.retain === true) {
                        // this message is a retained message, so its content is already in sum
                        return;
                    }
                    if (!payload || !payload?.result) {
                        (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateYear: the payload does not include a result", payload);
                    }
                    sumThisDay += payload.result;

                    if (typeof onupdate === "function") {
                        onupdate(year, sumYear + sumThisDay);
                    }
                });
            }, false, oncomplete, onerror || this.defaultErrorHandler);
        }, onstart, year !== yearToday ? oncomplete : false, onerror || this.defaultErrorHandler);
    }

    /**
     * gets the total sum excluding todays last 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {Function} onupdate as event function(firstDate, value) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    updateTotal (thingId, meansOfTransport, onupdate, onerror, onstart, oncomplete) {
        let sumWeekly = 0,
            sumThisWeek = 0,
            firstDate = false;
        const lastMonday = dayjs().startOf("isoWeek").toISOString(),
            urlWeekly = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_1-Woche';$expand=Observations($filter=phenomenonTime lt " + lastMonday + "))",
            urlThisWeeks15min = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_15-Min';$expand=Observations($filter=phenomenonTime ge " + lastMonday + "))";

        return this.http.get(urlWeekly, (datasetWeekly) => {
            if (!this.checkForObservations(datasetWeekly)) {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateTotal: datasetWeekly does not include a datastream with an observation", datasetWeekly);
            }
            sumWeekly = this.sumObservations(datasetWeekly);
            firstDate = this.getFirstDate(datasetWeekly);

            this.http.get(urlThisWeeks15min, (dataset15min) => {
                if (!this.checkForObservations(dataset15min)) {
                    (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateTotal: dataset15min does not include a datastream with an observation", dataset15min);
                }
                sumThisWeek = this.sumObservations(dataset15min);
                firstDate = this.getFirstDate(dataset15min, firstDate);

                if (typeof onupdate === "function") {
                    onupdate(dayjs(firstDate).format("YYYY-MM-DD"), sumWeekly + sumThisWeek);
                }

                // subscribe via mqtt
                const datastreamId = dataset15min[0].Datastreams[0]["@iot.id"],
                    topic = this.sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                // set retain to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
                this.mqttSubscribe(topic, {rh: 2}, (payload, packet) => {
                    if (packet && packet?.retain && packet.retain === true) {
                        // this message is a retained message, so its content is already in sum
                        return;
                    }
                    if (!payload || !payload?.result) {
                        (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateTotal: the payload does not include a result", payload);
                    }
                    sumThisWeek += payload.result;

                    if (typeof onupdate === "function") {
                        onupdate(dayjs(firstDate).format("YYYY-MM-DD"), sumWeekly + sumThisWeek);
                    }
                });
            }, false, oncomplete, onerror || this.defaultErrorHandler);
        }, onstart, false, onerror || this.defaultErrorHandler);
    }

    /**
     * gets the average of working days, excludes saturday, sunday and the given holidays
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {String} days the days from now to load the average from
     * @param {Object[]} holidays the holidays to exclude from the calculation
     * @param {Function} onupdate as event function(date, value)
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {void}
     */
    updateWorkingDayAverage (thingId, meansOfTransport, days, holidays, onupdate, onerror, onstart, oncomplete) {
        const startDate = dayjs().subtract(days, "day").toISOString(),
            endDate = dayjs().toISOString(),
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_1-Tag';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + ";$orderby=phenomenonTime ASC))";

        return this.http.get(url, (dataset) => {
            if (this.checkForObservations(dataset)) {
                const date = this.getFirstDate(dataset),
                    observations = dataset[0].Datastreams[0].Observations;
                let value = 0,
                    workDayCount = 0;

                observations.forEach(observation => {
                    const phenomenonTime = this.parsePhenomenonTime(observation?.phenomenonTime),
                        holiday = getPublicHoliday(phenomenonTime, holidays),
                        dayOfWeek = dayjs(phenomenonTime).isoWeekday();

                    if (holiday || dayOfWeek === 6 || dayOfWeek === 7) {
                        return;
                    }

                    value += typeof observation?.result === "number" ? observation.result : 0;
                    workDayCount++;
                });

                if (typeof onupdate === "function") {
                    onupdate(dayjs(date).format("YYYY-MM-DD"), workDayCount !== 0 ? Math.round(value / workDayCount) : 0);
                }
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateWorkingDayAverage: dataset does not include a datastream with observations", dataset);
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
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
     * @returns {Void}  -
     */
    updateHighestWorkloadDay (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        const startDate = dayjs(year, "YYYY").toISOString(),
            endDate = dayjs(year, "YYYY").add(1, "year").toISOString(),
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_1-Tag';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + ";$orderby=result DESC;$top=1))";

        return this.http.get(url, (dataset) => {
            if (this.checkForObservations(dataset)) {
                const value = this.sumObservations(dataset),
                    date = this.getFirstDate(dataset);

                if (typeof onupdate === "function") {
                    onupdate(dayjs(date).format("YYYY-MM-DD"), value);
                }
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateHighestWorkloadDay: dataset does not include a datastream with an observation", dataset);
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
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
     * @returns {Void}  -
     */
    updateHighestWorkloadWeek (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        const startDate = dayjs(year, "YYYY").toISOString(),
            endDate = dayjs(year, "YYYY").add(1, "year").toISOString(),
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_1-Woche';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + ";$orderby=result DESC;$top=1))";

        return this.http.get(url, (dataset) => {
            if (this.checkForObservations(dataset)) {
                const value = this.sumObservations(dataset),
                    date = this.getFirstDate(dataset);

                if (typeof onupdate === "function") {
                    onupdate(dayjs(date).week(), value);
                }
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateHighestWorkloadWeek: dataset does not include a datastream with an observation", dataset);
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
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
     * @returns {Void}  -
     */
    updateHighestWorkloadMonth (thingId, meansOfTransport, year, onupdate, onerror, onstart, oncomplete) {
        const startDate = dayjs(year, "YYYY").toISOString(),
            endDate = dayjs(year, "YYYY").add(1, "year").toISOString(),
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_1-Tag';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime lt " + endDate + "))",
            sumMonths = {"01": 0};
        let bestMonth = 0,
            bestSum = 0,
            month;

        return this.http.get(url, (dataset) => {
            if (this.checkForObservations(dataset)) {
                dataset[0].Datastreams[0].Observations.forEach(observation => {
                    if (!observation?.result || !observation?.phenomenonTime) {
                        // continue
                        return;
                    }

                    month = dayjs(this.parsePhenomenonTime(observation.phenomenonTime)).format("MM");
                    if (!Object.prototype.hasOwnProperty.call(sumMonths, month)) {
                        sumMonths[month] = 0;
                    }
                    sumMonths[month] += observation.result;

                    if (sumMonths[month] > bestSum) {
                        bestSum = sumMonths[month];
                        bestMonth = month;
                    }
                });

                if (typeof onupdate === "function") {
                    onupdate(bestMonth, bestSum);
                }
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateHighestWorkloadMonth: dataset does not include a datastream with an observation", dataset);
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
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
     * @param {String} [todayUntilOpt=NOW] as a String marking todays date in format YYYY-MM-DD; if left false, today is set automatically
     * @returns {Void}  -
     */
    updateDataset (thingId, meansOfTransport, timeSettings, onupdate, onerror, onstart, oncomplete, todayUntilOpt) {
        const from = timeSettings.from,
            until = timeSettings.until,
            interval = timeSettings.interval,
            startDate = dayjs(from, "YYYY-MM-DD").toISOString(),
            endDate = dayjs(until, "YYYY-MM-DD").add(1, "day").toISOString(),
            // search for "trafficCountSVAktivierung" to find all lines of code to switch Kfz to Kfz + SV
            /*
            // use this code to enable Kfz + SV
            meansOfTransportFahrzeuge = "Anzahl_Kfz",
            meansOfTransportSV = "Anzahl_SV",
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_" + interval + "';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime le " + endDate + ";$orderby=phenomenonTime asc))",

            // use this code to enable Kfz with faked SV
            meansOfTransportFahrzeuge = "Anzahl_Kfz",
            meansOfTransportSV = "Anteil_SV",
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + (meansOfTransport === meansOfTransportSV ? meansOfTransportFahrzeuge : meansOfTransport) + this.layerNameInfix + "_" + interval + "';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime le " + endDate + ";$orderby=phenomenonTime asc))",
            */

            // use this code to enable Kfz without SV
            meansOfTransportFahrzeuge = "Anzahl_Kfz_withoutSV",
            meansOfTransportSV = "Anzahl_SV",
            url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_" + interval + "';$expand=Observations($filter=phenomenonTime ge " + startDate + " and phenomenonTime le " + endDate + ";$orderby=phenomenonTime asc))",


            result = {},
            todayUntil = todayUntilOpt || dayjs().format("YYYY-MM-DD");

        result[meansOfTransport] = {};

        return this.http.get(url, (dataset) => {
            if (this.checkForObservations(dataset)) {
                dataset[0].Datastreams[0].Observations.forEach(observation => {
                    if (typeof observation?.result !== "number" || !observation?.phenomenonTime) {
                        // continue
                        return;
                    }

                    const datetime = dayjs(this.parsePhenomenonTime(observation.phenomenonTime)).format("YYYY-MM-DD HH:mm:ss");

                    result[meansOfTransport][datetime] = observation.result;
                });

                if (meansOfTransport === meansOfTransportFahrzeuge) {
                    // call SV & subscribe
                    this.updateDataset(thingId, meansOfTransportSV, timeSettings, resultSV => {
                        if (typeof onupdate === "function") {
                            Object.assign(result, resultSV);
                            onupdate(result);
                        }
                    }, onerror, false, oncomplete, todayUntilOpt);
                }
                else if (typeof onupdate === "function") {
                    onupdate(result);
                }

                if (until >= todayUntil) {
                    // subscribe via mqtt
                    const datastreamId = dataset[0].Datastreams[0]["@iot.id"],
                        topic = this.sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                    // set retain to 2 to avoid getting the last message from the server, as this message is already included in the server call above (see doc\sensorThings_EN.md)
                    this.mqttSubscribe(topic, {rh: 2}, (payload, packet) => {
                        if (packet && packet?.retain && packet.retain === true) {
                            // this message is a retained message, so its content is already in sum
                            return;
                        }
                        if (payload && payload?.result && payload?.phenomenonTime) {
                            const datetime = dayjs(this.parsePhenomenonTime(payload.phenomenonTime)).format("YYYY-MM-DD HH:mm:ss");

                            result[meansOfTransport][datetime] = payload.result;

                            if (typeof onupdate === "function") {
                                onupdate(result);
                            }
                        }
                        else {
                            (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateDataset: the payload does not include a result", meansOfTransport, payload);
                        }
                    });
                }
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.updateDataset: dataset does not include a datastream with an observation", meansOfTransport, dataset);
            }
        }, onstart, meansOfTransport !== meansOfTransportFahrzeuge ? oncomplete : false, onerror || this.defaultErrorHandler);
    }

    /**
     * subscribes the last change of data based on 15 minutes
     * @param {Integer} thingId the ID of the thing
     * @param {String} meansOfTransport the transportation as 'Anzahl_Fahrraeder' or 'Anzahl_Kfz'
     * @param {Function} [onupdate] as event function(phenomenonTime) fires initialy and anytime server site changes are made
     * @param {Function} [onerror] as function(error) to fire on error
     * @param {Function} [onstart] as function() to fire before any async action has started
     * @param {Function} [oncomplete] as function() to fire after every async action no matter what
     * @returns {Void}  -
     */
    subscribeLastUpdate (thingId, meansOfTransport, onupdate, onerror, onstart, oncomplete) {
        const url = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_15-Min')";

        // get the datastreamId via http to subscribe to with mqtt
        return this.http.get(url, (dataset) => {
            if (
                Array.isArray(dataset) && dataset.length > 0 && dataset[0]?.Datastreams
                && Array.isArray(dataset[0].Datastreams) && dataset[0].Datastreams.length > 0 && Object.prototype.hasOwnProperty.call(dataset[0].Datastreams[0], "@iot.id")
            ) {
                // subscribe via mqtt
                const datastreamId = dataset[0].Datastreams[0]["@iot.id"],
                    topic = this.sensorThingsVersion + "/Datastreams(" + datastreamId + ")/Observations";

                // set retain to 0 to get the last message from the server immediately (see doc\sensorThings_EN.md)
                this.mqttSubscribe(topic, {rh: 0}, (payload) => {
                    if (payload && payload?.resultTime) {
                        if (typeof onupdate === "function") {
                            const datetime = dayjs(payload.resultTime).format("YYYY-MM-DD HH:mm:ss");

                            onupdate(datetime);
                        }
                    }
                    else {
                        (onerror || this.defaultErrorHandler)("TrafficCountAPI.subscribeLastUpdate: the payload does not include a resultTime", payload);
                    }
                });
            }
            else {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.subscribeLastUpdate: the response does not include a Datastream with a proper @iot.id", dataset);
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
    }

    /**
     * unsubscribe all subscriptions that have been made so far by any function of this api
     * @param {Function} [onsuccess] an event function() to fire when all subscriptions have been successfully canceled
     * @returns {Void}  -
     */
    unsubscribeEverything (onsuccess) {
        const topics = Object.keys(this.getSubscriptionTopics());

        this.setSubscriptionTopics({});

        if (this.mqttClient && typeof this.mqttClient.unsubscribe === "function" && Array.isArray(topics) && topics.length > 0) {
            topics.forEach(topic => {
                this.mqttClient.unsubscribe(topic);
            });
        }

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
     * @returns {Void}  -
     */
    downloadData (thingId, meansOfTransport, timeSettings, onsuccess, onerror, onstart, oncomplete) {
        if (typeof onstart === "function") {
            onstart();
        }

        this.updateTitle(thingId, title => {
            this.updateDataset(thingId, meansOfTransport, timeSettings, dataset => {
                if (typeof onsuccess === "function") {
                    onsuccess({
                        title: title,
                        data: dataset
                    });
                }
                if (typeof oncomplete === "function") {
                    oncomplete();
                }

                // prohibit subscription by using the last param with a future date for today
            }, onerror, false, false, dayjs().add(1, "month").format("YYYY-MM-DD"));
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
     * @returns {Void}  -
     */
    getFirstDateEver (thingId, meansOfTransport, onsuccess, onerror, onstart, oncomplete) {
        const urlWeekly = this.baseUrlHttp + "/Things(" + thingId + ")?$expand=Datastreams($filter=properties/layerName eq '" + meansOfTransport + this.layerNameInfix + "_1-Woche';$expand=Observations)";

        return this.http.get(urlWeekly, (datasetWeekly) => {
            if (!this.checkForObservations(datasetWeekly)) {
                (onerror || this.defaultErrorHandler)("TrafficCountAPI.getFirstDate: datasetWeekly does not include a datastream with an observation", datasetWeekly);
                return;
            }

            if (typeof onsuccess === "function") {
                onsuccess(this.getFirstDate(datasetWeekly));
            }
        }, onstart, oncomplete, onerror || this.defaultErrorHandler);
    }

    /**
     * gets the subscribed topics
     * @returns {Object}  an object {topic => [callback(payload)]} with all subscriptions
     */
    getSubscriptionTopics () {
        return this.subscriptionTopics;
    }

    /**
     * sets the subscribed topics
     * @info this is for the purpose of testing
     * @param {Object} object an object {topic => [callback(payload)]} with all subscriptions
     * @returns {Void}  -
     */
    setSubscriptionTopics (object) {
        this.subscriptionTopics = object;
    }

    /**
     * gets the base url for http calls
     * @returns {String}  the used base url vor http calls
     */
    getBaseUrlHttp () {
        return this.baseUrlHttp;
    }

    /**
     * gets the on construction initialized mqtt client
     * @returns {Object}  the mqtt client
     */
    getMqttClient () {
        return this.mqttClient;
    }

    /**
     * gets the on construction initialized http connector
     * @returns {Object}  the SensorThingsHttp
     */
    getSensorThingsHttp () {
        return this.http;
    }

    /**
     * gets the layerName infix (this is used for testing)
     * @returns {String}  the currently used layerName infix
     */
    getLayerNameInfix () {
        return this.layerNameInfix;
    }
}
