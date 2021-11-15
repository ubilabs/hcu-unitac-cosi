import {GeoJSON} from "ol/format";
import Feature from "ol/Feature";

export default {
    serializeState () {
        const state = this.deepCopyState(this.storePaths, this.$store.state);

        this.serializeScenarios(state);
        this.serializeBackboneModules(state);
        this.state = state;
    },

    deepCopyState (map, store) {
        const state = {};

        for (const key in map) {
            if (
                Array.isArray(map[key]) &&
                map[key].every(e => typeof e === "string")
            ) {
                state[key] = {};
                for (const attr of map[key]) {
                    const val = this.serializeFeatures(store[key][attr]);

                    state[key][attr] = val;
                }
            }
            else if (map[key].constructor === Object) {
                state[key] = this.deepCopyState(map[key], store[key]);
            }
        }

        return state;
    },

    serializeFeatures (val) {
        const parser = new GeoJSON();
        let res;

        if (!Array.isArray(val)) {
            if (val?.constructor === Feature) {
                res = parser.writeFeatureObject(val);

                res.properties.isOlFeature = true;
            }
            else {
                res = val;
            }
        }
        else {
            res = [];

            for (let i = 0; i < val.length; i++) {
                if (val[i].constructor === Feature) {
                    const geojson = parser.writeFeatureObject(val[i]);

                    geojson.properties.isOlFeature = true;
                    res.push(geojson);
                }
                else {
                    res.push(val[i]);
                }
            }
        }

        return res;
    },

    serializeScenarios (state) {
        const parser = new GeoJSON();

        state.Tools.ScenarioBuilder.scenarios =
            state.Tools.ScenarioBuilder.scenarios.map(
                scenario => this.serializeScenario(scenario, parser)
            );
    },

    serializeScenario (scenario, parser) {
        const simulatedFeatures = scenario.getSimulatedFeatures().map(
                scenarioFeature => this.serializeScenarioFeature(scenarioFeature, parser)
            ),
            modifiedFeatures = scenario.getModifiedFeatures().map(
                scenarioFeature => this.serializeScenarioFeature(scenarioFeature, parser, true)
            ),
            neighborhoods = scenario.getNeighborhoods().map(
                scenarioNeighborhood => this.serializeNeighborhood(scenarioNeighborhood, parser)
            );

        return {
            ...scenario,
            guideLayer: null,
            isActive: false,
            simulatedFeatures,
            modifiedFeatures,
            neighborhoods
        };
    },

    serializeScenarioFeature (scenarioFeature, parser, revertToOriginalData = false) {
        const feature = parser.writeFeatureObject(scenarioFeature.feature);

        // serialize geometry (original data)
        if (feature.properties.originalData?.geometry) {
            feature.properties.originalData.geometry = this.serializeGeometry(feature.properties.originalData.geometry);
        }

        // serialize geometry (scenario data)
        if (scenarioFeature.scenarioData.geometry) {
            scenarioFeature.scenarioData.geometry = this.serializeGeometry(scenarioFeature.scenarioData.geometry);
        }

        if (revertToOriginalData) {
            feature.geometry = feature.properties.originalData?.geometry || feature.geometry;
            feature.properties = {
                ...feature.properties,
                ...feature.properties.originalData || {}
            };
        }

        // delete original Data if necessary
        if (Object.hasOwnProperty.call(feature.properties, "originalData")) {
            delete feature.properties.originalData;
        }

        // delete geometry from properties
        if (Object.hasOwnProperty.call(feature.properties, "geometry")) {
            delete feature.properties.geometry;
        }

        return {
            ...scenarioFeature,
            guideLayer: null,
            scenario: null,
            eventKeys: null,
            feature: feature,
            layer: scenarioFeature.layer.get("id")
        };
    },

    serializeNeighborhood (scenarioNeighborhood, parser) {
        return {
            feature: parser.writeFeatureObject(scenarioNeighborhood.feature)
        };
    },

    serializeBackboneModules (state) {
        state.Backbone = {};

        state.Backbone.Filter = this.serializeFilters();
    },

    serializeFilters () {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: "filter"});

        console.log(model);
    },

    serializeGeometry (geom) {
        const
            type = geom.getType(),
            coordinates = geom.getCoordinates();

        return {
            type, coordinates
        };
    }
};
