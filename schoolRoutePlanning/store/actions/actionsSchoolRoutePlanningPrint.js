import BuildSpecModel from "../../../../modules/tools/print/buildSpec";

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
    printRoute ({state, rootGetters}) {
        const routeElements = state.routeElements,
            visibleLayerList = sortVisibleLayerList(rootGetters["Map/visibleLayerList"], state.layerName),
            attributes = {
                "layout": state.printLayout,
                "outputFormat": state.printOutputFormat,
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

        let buildSpec = new BuildSpecModel(attributes);

        buildSpec.buildLayers(visibleLayerList);
        buildSpec = buildSpec.toJSON();

        Radio.trigger("Print", "createPrintJob", encodeURIComponent(JSON.stringify(buildSpec)), "schulwegrouting", state.printOutputFormat);
    }
};
