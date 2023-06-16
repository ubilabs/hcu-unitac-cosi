import {Config} from "../config";
import axios from "axios";
import {buildEndpointUrl} from "../utils/buildEndpointUrl";

const apiEndpointService = {
    /**
     * Receive "dwell times" from the endpoint.
     * @param {String} locationId Current location ID
     * @param {String} date Date in format YYYY-MM-DD
     * @return {Promise<axios.AxiosResponse<any>>} Dwell times data
     */
    async  receiveDwellTimes (locationId, date = null) {
        const
            url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/dwell-times/`,
            query = {
                "location_id": locationId,
                "group_by[date]": null,
                "group_by[DwellTime]": null,
                "aggregate[Sum]": "num_visitors",
                "format": "agg",
                "pulse": false,
                "use_zone": true,
                "transportation": "pedestrian"
            };

        if (date !== null) {
            query.date = date;
        }

        return axios.get(
            buildEndpointUrl(url, query)
        );
    },
    /**
     * Receive "age groups" from the endpoint.
     * @param {String} locationId Current location ID
     * @param {String} date Date in format YYYY-MM-DD
     * @return {Promise<axios.AxiosResponse<any>>} Age groups data
     */
    async receiveAgeGroups (locationId, date = null) {
        const
            url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/ages/`,
            query = {
                "location_id": locationId,
                "group_by[date]": null,
                "group_by[age_group]": null,
                "aggregate[Sum]": "num_visitors",
                "format": "agg",
                "pulse": false,
                "use_zone": true,
                "transportation": "pedestrian"
            };

        if (date !== null) {
            query.date = date;
        }

        return axios.get(
            buildEndpointUrl(url, query)
        );
    },
    /**
     * Receive "visitor types" from the endpoint.
     * @param {String} locationId Current location ID
     * @param {String} date Date in format YYYY-MM-DD
     * @return {Promise<axios.AxiosResponse<any>>} Visitor types data
     */
    async receiveVisitorTypes (locationId, date = null) {
        const
            url = `${Config.whatalocationApi.host}${Config.whatalocationApi.basepath}/visitor-types/`,
            query = {
                "location_id": locationId,
                "group_by[date]": null,
                "group_by[VisitorType]": null,
                "aggregate[Sum]": "num_visitors",
                "format": "agg",
                "pulse": false,
                "use_zone": true,
                "transportation": "pedestrian"
            };

        if (date !== null) {
            query.date = date;
        }

        return axios.get(
            buildEndpointUrl(url, query)
        );
    }
};

export default apiEndpointService;
