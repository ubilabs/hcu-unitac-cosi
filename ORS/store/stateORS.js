export default {
    // common attributes for tools
    active: false,
    id: "ORS",
    name: "OpenRouteService",
    glyphicon: "glyphicon-map",
    isVisibleInMenu: false,
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
    defaultRequestService: "isochrones",
    defaultRequestProfile: "foot-walking",
    defaultJoinIsochrones: true,
    requestData: {},
    geoJson: []
};
