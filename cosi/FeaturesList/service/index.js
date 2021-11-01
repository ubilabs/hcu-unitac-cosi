import {getAllFeatures} from "../../utils/getAllFeatures";
import * as Proj from "ol/proj.js";
import {fetchDistances} from "./fetchDistances";
import {findNearestFeatures} from "../../utils/findNearestFeatures";
import {getFeatureInfos} from "./getFeatureInfo";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";
import {getConverter} from "../utils/converters";

/**
 *
 * @param {*} features features
 * @return {*} transformed features
 */
function transformedCoordinates (features) {
    return features.map(f => Proj.transform(f.getGeometry().flatCoordinates, "EPSG:25832", "EPSG:4326").slice(0, 2));
}

/**
 *
 *
 * @param {*} feature feature
 * @param {*} layerId layerId
 * @param {*} extent extent
 * @param {*} initialBuffer initial buffer
 * @param {*} bufferIncrement buffer increment
 * @return {*} score
 */
async function layerScore (feature, layerId, extent, initialBuffer, bufferIncrement) {
    const featureCoords = transformedCoordinates([feature]),
        coords = extent ? transformedCoordinates(await getAllFeatures(layerId, extent))
            : transformedCoordinates(await findNearestFeatures(layerId, feature, initialBuffer, bufferIncrement)),
        dists = (await fetchDistances(featureCoords, coords))[0];

    if (dists === null) {
        return null;
    }

    let mindist = Infinity;

    for (let i = 0; i < dists.length; i++) {
        if (dists[i] !== null && dists[i] < mindist) {
            mindist = dists[i];
        }
    }

    return mindist;
}

/**
 *
 * @param {*} feature feature
 * @param {*} layerIds layerIds
 * @param {*} weights weights
 * @return {*} score
 */
async function distanceScore ({getters, commit}, {feature, weights, layerIds, extent}) {
    if (weights === undefined || weights.length !== layerIds.length) {
        throw Error("invalid argument: weights");
    }

    let vsum = 0,
        wsum = 0;

    for (let j = 0; j < layerIds.length; j++) {
        const id = feature.getId().toString() + layerIds[j].toString() + (extent && getters.useUserExtent ? extent.toString() : "");

        let mindist = getters.mindists[id];

        if (mindist === undefined) {
            mindist = await layerScore(feature, layerIds[j], extent, getters.initialBuffer, getters.bufferIncrement);
            commit("setMindists", {...getters.mindists, [id]: mindist});
        }

        if (mindist === null) {
            return null;
        }

        if (mindist === Infinity) {
            continue;
        }

        vsum += weights[j] * mindist;
        wsum += weights[j];
    }

    return vsum / wsum;
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
        default:
        case "mean":
        {
            let m = 0;

            for (const v of values) {
                m += v;
            }
            return m / values.length;
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
async function featureValues ({getters}, {feature, layerId}) {

    const layer = getLayerWhere({id: layerId}),
        coord = feature.getGeometry().flatCoordinates.slice(0, 2),
        wmsAttrs = getters.wmsLayers.find(l => l.id === layerId),
        converter = getConverter(wmsAttrs.converter),
        infos = await getFeatureInfos(layer.url, layer.layers, coord, "EPSG:25832", wmsAttrs.resolution, wmsAttrs.featureCount);

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
            active: true,
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
            ]
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
        name: id
    },
    store
};
