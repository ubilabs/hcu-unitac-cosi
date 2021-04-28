import BuildSpecModel from "../../../../modules/tools/print/buildSpec";

export default {
    /**
     * Prints the route via the print module.
     * @param {Object} context The vuex context.
     * @returns {void}
     */
    printRoute ({state, rootState}) {
        const routeElements = state.routeElements,
            visibleLayerList = rootState.Map.layerList.filter(layer => layer.getVisible() === true),
            attributes = {
                "layout": state.printLayout,
                "outputFormat": state.printOutputFormat,
                "attributes": {
                    "title": state.printTitle,
                    "length": `${routeElements.kuerzesteStrecke}m`,
                    "address": state.inputAddress,
                    "school": `${state.selectedSchool.get("schulname")}, ${routeElements.SchuleingangTyp} (${routeElements.SchuleingangAdresse})`,
                    "map": {
                        "dpi": state.printDpi,
                        "projection": Radio.request("MapView", "getProjection").getCode(),
                        "center": Radio.request("MapView", "getCenter"),
                        "scale": Radio.request("MapView", "getOptions").scale
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

        Radio.trigger("Print", "createPrintJob", encodeURIComponent(JSON.stringify(buildSpec)), "schulwegrouting", "pdf");
    }
};
