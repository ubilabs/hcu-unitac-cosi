import * as Proj from "ol/proj.js";
import {fetchDistances} from "./fetchDistances";
import {findNearestFeatures} from "../../utils/findNearestFeatures";
import {getFeatureInfos} from "./getFeatureInfo";
import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import {getConverter} from "../utils/converters";

/**
 *
 * @param {module:ol/Feature[]} features features
 * @param {String} sourceCrs current CRS
 * @return {Number[]} transformed feature coordinates
 */
function transformedCoordinates (features, sourceCrs) {
    return features.map(f => Proj.transform(f.getGeometry().flatCoordinates, sourceCrs, "EPSG:4326").slice(0, 2));
}

/**
 *
 *
 * @param {module:ol/Feature} feature feature
 * @param {String} layerId layerId
 * @param {Number} initialBuffer initial buffer
 * @param {Number} bufferIncrement buffer increment
 * @param {String} portalCrs current CRS
 * @param {String} serviceId routing service
 * @param {String} fallbackId alternative routing service
 * @return {Number} score
 */
async function layerScore (feature, layerId, initialBuffer, bufferIncrement, portalCrs, serviceId, fallbackId) {
    const featureCoords = transformedCoordinates([feature], portalCrs),
        features = await findNearestFeatures(layerId, feature, initialBuffer, bufferIncrement, 10, "EPSG:25832"),
        coords = transformedCoordinates(features, portalCrs),
        dists = (await fetchDistances(featureCoords, coords, undefined, serviceId, fallbackId))[0];

    if (dists === null) {
        return null;
    }

    let mindist = Infinity,
        minFeature;


    for (let i = 0; i < dists.length; i++) {
        if (dists[i] !== null && dists[i] < mindist) {
            mindist = dists[i];
            minFeature = features[i];
        }
    }

    return {dist: mindist, feature: minFeature};
}

/**
 *
 * @param {*} feature feature
 * @param {*} layerIds layerIds
 * @param {*} weights weights
 * @return {*} score
 */
async function distanceScore ({getters, commit, rootGetters}, {feature, weights, layerIds, extent}) {
    if (weights === undefined || weights.length !== layerIds.length) {
        throw Error("invalid argument: weights");
    }

    let vsum = 0,
        wsum = 0;

    const ret = {};

    for (let j = 0; j < layerIds.length; j++) {
        const id = feature.getId().toString() + layerIds[j].toString() + (extent && getters.useUserExtent ? extent.toString() : "");

        let mindist = getters.mindists[id];

        if (!mindist) {
            mindist = await layerScore(feature, layerIds[j], getters.initialBuffer, getters.bufferIncrement, rootGetters["Maps/projectionCode"], getters.serviceId, getters.fallbackServiceId);
            commit("setMindists", {...getters.mindists, [id]: mindist});
        }

        if (mindist === null) {
            return null;
        }

        if (mindist === Infinity) {
            continue;
        }

        // eslint-disable-next-line one-var
        const value = weights[j] * mindist.dist;

        ret[layerIds[j]] = {value, feature: mindist.feature};

        vsum += value;
        wsum += weights[j];
    }

    ret.score = vsum / wsum;

    return ret;
}

/**
 *
 * @param {*} values values
 * @param {*} type type
 * @return {*} aggregate
 */
function aggregate (values, type) {
    if (!values || values.length === 0) {
        return null;
    }
    switch (type) {
        case "max":
        {
            let m = -Infinity;

            for (const v of values) {
                if (v > m) {
                    m = v;
                }
            }
            return m;
        }
        case "mean":
        {
            let m = 0;

            for (const v of values) {
                m += v;
            }
            return m / values.length;
        }
        default: {
            return null;
        }
    }
}

/**
 *
 * @param {*} feature feature
 * @param {*} layerIds layerIds
 * @param {*} weights weights
 * @return {*} score
 */
async function featureValues ({getters, rootGetters}, {feature, layerId}) {
    const layer = getLayerWhere({id: layerId}),
        coord = feature.getGeometry().flatCoordinates.slice(0, 2),
        wmsAttrs = getters.wmsLayers.find(l => l.id === layerId),
        converter = getConverter(wmsAttrs.converter),
        infos = await getFeatureInfos(layer.url, layer.layers, coord, rootGetters["Maps/projectionCode"], wmsAttrs.resolution, wmsAttrs.featureCount);

    if (infos.length > 0) {
        return aggregate(infos.map(info => converter.convert(info.getProperties()[wmsAttrs.attribute])),
            wmsAttrs.aggregation);
    }
    return null;
}

const id = "DistanceScoreService",
    actions = {
        async getDistanceScore (store, params) {
            return distanceScore(store, params);
        },
        async getFeatureValues (store, params) {
            return featureValues(store, params);
        }
    },
    store = {
        namespaced: true,
        state: {
            active: false,
            id,
            mindists: {},
            useUserExtent: false,
            initialBuffer: 5000,
            bufferIncrement: 10000,
            wmsLayers: [
                {
                    id: "95",
                    name: "Straßenlärm 2017",
                    attribute: "klasse",
                    resolution: 26,
                    featureCount: 10,
                    converter: "DbRangeConverter",
                    aggregation: "max"
                }
            ],
            serviceId: "bkg_ors",
            fallbackServiceId: "csl_ors"
        },
        getters: {
            mindists: s => {
                return s.mindists;
            },
            useUserExtent: s => {
                return s.useUserExtent;
            },
            initialBuffer: s => {
                return s.initialBuffer;
            },
            bufferIncrement: s => {
                return s.bufferIncrement;
            },
            wmsLayers: s => {
                return s.wmsLayers;
            },
            wmsLayersInfo: s => {
                return s.wmsLayers; // .map(l => ({id: l.id, name: getLayerWhere({id: l.id}).name}));
            },
            serviceId: s => {
                return s.serviceId;
            },
            fallbackServiceId: s => {
                return s.fallbackServiceId;
            }
        },
        mutations: {
            setMindists: (moduleState, payload) => {
                moduleState.mindists = payload;
            }
        },
        actions,
        computed: {
            // ...mapState(["configJson"])
        }
    };

export default {
    component: {
        name: id,
        render () {
            return null;
        }
    },
    store
};
