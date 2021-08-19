import SpecModel from "./../../../../src/modules/tools/print/store/utils/buildSpec";

/**
 * Setes the school route layer to end of the visible vector layer list.
 * @param {ol/VectorLayer[]} [visibleLayerList=[]] The visible vector layers.
 * @param {String} layerName The name of the school route layer.
 * @returns {ol/VectorLayer[]} The sorted vector layer list.
 */
function sortVisibleLayerList (visibleLayerList = [], layerName) {
    const sortedVisibleLayerList = [];
    let schoolRouteLayer = null;

    visibleLayerList.forEach(layer => {
        if (layer.get("name") === layerName) {
            schoolRouteLayer = layer;
        }
        else {
            sortedVisibleLayerList.push(layer);
        }
    });

    sortedVisibleLayerList.push(schoolRouteLayer);

    return sortedVisibleLayerList;
}


export default {
    /**
     * Prints the route via the print module.
     * @param {Object} context The vuex context.
     * @returns {void}
     */
    printRoute ({state, rootGetters, dispatch}) {
        const routeElements = state.routeElements,
            visibleLayerList = sortVisibleLayerList(rootGetters["Map/visibleLayerList"], state.layerName),
            attributes = {
                "layout": state.printLayout,
                "outputFormat": state.printOutputFormat,
                "outputFilename": "Schulweg",
                "attributes": {
                    "title": state.printTitle,
                    "length": `${routeElements.kuerzesteStrecke}m`,
                    "address": state.selectedAddress,
                    "school": `${state.selectedSchool?.get("schulname")}, ${routeElements.SchuleingangTyp} (${routeElements.SchuleingangAdresse})`,
                    "map": {
                        "dpi": state.printDpi,
                        "projection": Radio.request("MapView", "getProjection")?.getCode(),
                        "center": Radio.request("MapView", "getCenter"),
                        "scale": Radio.request("MapView", "getOptions")?.scale
                    },
                    "datasource": [{
                        "table": {
                            "columns": ["index", "description"],
                            "data": state.routeDescription
                        }
                    }]
                }
            };

        dispatch("Tools/Print/activatePrintStarted", true, { root: true });
        let spec = SpecModel;
        spec.setAttributes(attributes);

        spec.buildLayers(visibleLayerList);
        const printJob = {
            "payload": encodeURIComponent(JSON.stringify(spec.defaults)),
            "printAppId": "schulwegrouting",
            "currentFormat": state.printOutputFormat
        };

        dispatch("Tools/Print/createPrintJob", printJob, { root: true });
    }
};
