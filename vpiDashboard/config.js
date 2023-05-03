let DevConfig;

try {
    const DevConfigImport = require("./config.local.js");

    DevConfig = DevConfigImport.DevConfig;
}
catch (e) {
    DevConfig = {};
}
/* eslint-disable no-unused-vars */
export const Config = Object.assign({
    whatalocationApi: {
        host: "https://whatalocation.io",
        basepath: "/api/v2",
        auth_token: ""
    }
}, DevConfig);
