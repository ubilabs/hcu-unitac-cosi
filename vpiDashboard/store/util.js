import {Config} from "../config";
import isDevMode from "../../../src/utils/isDevMode";

/**
 * Return the authorisation header to be sent to WhatALocation endpoint
 * @returns {Object} contains authorisation header if in dev environment
 */
export default function defineAuthorisationHeader () {
    if (isDevMode) {
        return {
            "Authorization": `Bearer ${Config.whatalocationApi.auth_token}`
        };
    }

    return {};
}
