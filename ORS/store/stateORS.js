export default {
    // common attributes for tools
    active: true,
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
    defaultRequestProfile: "/isochrones/foot-walking",
    requestData: {},
    // coords: null,
    geoJson: []
};
