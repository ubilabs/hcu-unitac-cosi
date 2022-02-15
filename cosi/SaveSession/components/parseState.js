import getComponent from "../../../../src/utils/getComponent";
import {GeoJSON} from "ol/format";
import ScenarioNeighborhood from "../../ScenarioBuilder/classes/ScenarioNeighborhood";
import ScenarioFeature from "../../ScenarioBuilder/classes/ScenarioFeature";
import Scenario from "../../ScenarioBuilder/classes/Scenario";

export default {
    parseState (map, state, path = []) {
        for (const key in map) {
            if (
                Array.isArray(map[key]) &&
                Object.hasOwnProperty.call(state, key) &&
                map[key].every(e => typeof e === "string")
            ) {
                for (const attr of map[key]) {
                    // continue if prop doesn't exist on the save state
                    if (!Object.hasOwnProperty.call(state[key], attr)) {
                        continue;
                    }
                    let mutation = `${key}/set${attr[0].toUpperCase() + attr.substring(1)}`;

                    // add parent nodes for nested states
                    if (path.length > 0) {
                        mutation = path.join("/") + "/" + mutation;
                    }

                    switch (`${key}/${attr}`) {
                        case "ScenarioBuilder/scenarios":
                            this.$store.commit(mutation, this.parseScenarios(state[key][attr]));
                            break;
                        case "DistrictSelector/selectedDistrictNames":
                            this.$nextTick(async () => {
                                // hacky, wait for the districtStyle to be drawn
                                await this.$nextTick();
                                this.setDistrictsByName({
                                    districtNames: state[key][attr],
                                    zoomToExtent: false
                                });
                            });
                            break;
                        case "Map/layerIds":
                            this.$nextTick(() => {
                                state[key][attr].forEach(layerId => this.getTopicsLayer(layerId));
                            });
                            break;
                        case "Map/zoomLevel":
                            this.$store.dispatch(mutation, state[key][attr]);
                            break;
                        default:
                            this.commitState(mutation, attr, state[key][attr]);
                    }
                }
            }
            else if (map[key].constructor === Object) {
                state[key] = this.parseState(map[key], state[key], [...path, key]);
            }
        }

        console.log(this.$store);
    },

    commitState (mutation, attr, state) {
        if (attr === "active") {
            if (state) {
                this.$store.commit(mutation, state);

                const key = mutation.replace("/setActive", "/id"),
                    model = getComponent(this.$store.getters[key]);

                if (model) {
                    model.set("isActive", state);
                }
            }
        }
        else {
            this.$store.commit(mutation, this.parseFeatures(state));
        }
    },

    parseFeatures (val) {
        const parser = new GeoJSON();

        if (!Array.isArray(val)) {
            if (val?.constructor === Object && val?.properties?.isOlFeature) {
                return parser.readFeature(val);
            }
            if (val?.constructor === Object && val?.isOlGeometry) {
                return parser.readGeometry(val);
            }
            return val;
        }

        return val.map(el => {
            if (el?.constructor === Object && el?.properties?.isOlFeature) {
                return parser.readFeature(el);
            }
            return el;
        });
    },

    parseScenarios (scenarios) {
        const parser = new GeoJSON();

        return scenarios.map(scenario => this.parseScenario(scenario, parser));
    },

    parseScenario (scenario, parser) {
        const
            simulatedFeatures = scenario.simulatedFeatures.map(scenarioFeature => this.parseScenarioFeature(scenarioFeature, parser)),
            modifiedFeatures = scenario.modifiedFeatures.map(scenarioFeature => this.parseScenarioFeature(scenarioFeature, parser)),
            neighborhoods = scenario.neighborhoods.map(scenarioFeature => this.parseScenarioNeighborhood(scenarioFeature, parser)),
            _scenario = new Scenario(
                scenario.name,
                this.simGuideLayer,
                {
                    simulatedFeatures,
                    modifiedFeatures,
                    neighborhoods
                }
            );

        return _scenario;
    },

    parseScenarioFeature (scenarioFeature, parser) {
        const
            layer = this.getTopicsLayer(scenarioFeature.layer),
            feature = parser.readFeature(scenarioFeature.feature),
            scenarioData = scenarioFeature.scenarioData,
            originalData = scenarioFeature.feature.properties.originalData;

        // parse geom (original data)
        if (originalData) {
            if (originalData.geometry) {
                this.parseGeometry(originalData.geometry);
            }
            feature.set("originalData", originalData);
        }

        // parse geom (original data)
        if (scenarioData.geometry) {
            scenarioData.geometry = this.parseGeometry(scenarioData.geometry);
        }

        return new ScenarioFeature(feature, layer, undefined, scenarioData);
    },

    parseScenarioNeighborhood (scenarioNeighborhood, parser) {
        const feature = parser.readFeature(scenarioNeighborhood.feature);

        return new ScenarioNeighborhood(feature, this.simNeighborhoodLayer, this.districtLevels);
    },

    parseDistrictLevel (districtLevelLabel) {
        return this.districtLevels.find(districtLevel => districtLevel.label === districtLevelLabel);
    },

    parseGeometry ({type, coordinates}) {
        if (!type || !coordinates) {
            return undefined;
        }

        return new this.geomConstructors[type](coordinates);
    }
};
