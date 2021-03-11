/* eslint-disable no-irregular-whitespace */
/**
 * User type definition
 * @typedef {Object} OpenRouteServiceState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {String} id - The id of the OpenRouteService component.
 * @property {String} [name=OpenRouteService] - The name of the tool (config-param).
 * @property {String} [glyphicon="glyphicon-map"] - Bootstrap glyphicon class (config-param).
 * @property {Boolean} [isVisibleInMenu=false] - Show the tool in the menu bar if true (config-param).
 * @property {Boolean} [renderToWindow=false] - Renders tool in a window if true, otherwise in the sidebar (config-param).
 * @property {Boolean} [resizableWindow=false] - If True, window is resizable (config-param).
 * @property {String} [layerId=ORS] - The ID of the drawing OpenLayers Layer (config-param)
 * @property {module:ol​/layer​/Vector} drawingLayer - the drawing OpenLayers Vector Layer, auto generated.
 * @property {Number} [zIndex=3000] - The zIndex of the layer to draw on (config-param)
 * @property {String} [requestUrl=https://api.openrouteservice.org/v2] - The URL of the respective OpenRouteService instance, e.g. (config-param)
 * @property {String} apiKey - The API key / Authorization for the service (config-param)
 * @property {String} [colorspace=interpolateRdYlGn] - The color scheme for the visualization
 * @property {Number} [coloralpha=0.1] - Opacity of the drawn features (config-param)
 * @property {Number} [innerLineWidth=1.5] - line width of the inner lines of isochrones (config-param)
 * @property {Number} [outerLineWidth=4.5] - line width of the outer line of an isochrone, line width of line features (config-param)
 * @property {Object} [crs={portal:"EPSG:25832",service:"EPSG:4326"}] - the CRS of the portal and the service (config-param)
 * @property {Object} [crs={portal:"EPSG:25832",service:"EPSG:4326"}] - the CRS of the portal and the service (config-param)
 * @property {Object} defaultRequestBody - fallbacks if data is provided only partly
 * @property {Object} [defaultRequestProfile=foot-walking] - default request profile, if not provided (config-param)
 * @property {Object} [defaultRequestService=isochrones] - default request serivce, if not provided (config-param)
 * @property {Object} [requestProfiles=["foot-walking", "driving-car", "driving-lgv", "cycling-regular", "cycling-electric", "wheelchair"]] - request profiles available (config-param)
 * @property {Object} [requestServices=["isochrones", "matrix", "directions"]] - request serivces available (config-param)
 * @property {Boolean} [defaultJoinIsochrones=true] - defines whether isochrones of the same level will be joined if the intersect (config-param).
 * @property {Object} requestData - the Request Data provided via the newRequest action
 * @property {Object} geoJson - the currently drawn map features
 */
export default {
    // common attributes for tools
    active: false,
    id: "OpenRouteService",
    name: "OpenRouteService",
    glyphicon: "glyphicon-map",
    isVisibleInMenu: false,
    renderToWindow: false,
    resizableWindow: false,
    // default service parameters
    layerId: "ORS",
    drawingLayer: null,
    zindex: 3000,
    requestUrl: "https://api.openrouteservice.org/v2",
    apiKey: null,
    colorspace: "interpolateRdYlGn",
    coloralpha: 0.1,
    innerLineWidth: 1.5,
    outerLineWidth: 4.5,
    crs: {
        portal: "EPSG:25832",
        service: "EPSG:4326"
    },
    // fallbacks if data is provided only partly
    defaultRequestBody: {
        locations: [],
        range: [500],
        interval: 100,
        options: {},
        range_type: "distance"
    },
    defaultRequestProfile: "foot-walking",
    defaultRequestService: "isochrones",
    requestProfiles: ["foot-walking", "driving-car", "driving-lgv", "cycling-regular", "cycling-electric", "wheelchair"],
    requestServices: ["isochrones", "matrix", "directions"],
    defaultJoinIsochrones: true,
    requestData: {},
    geoJson: []
};
