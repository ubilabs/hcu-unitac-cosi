import {collectFeatures} from "./collectFeatures.js";
import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";

/**
 * Creates the knowledge base by the services config.
 * @param {Object} parcelData - The parcel.
 * @param {Number[]} parcelData.centerCoordinate - The center of the parcel extent.
 * @param {ol/extent} parcelData.extent - The extent of the parcel.
 * @param {ol/geom/Polygon} parcelData.geometry - The geometry of the parcel.
 * @param {Object} services - The services config for the valuation.
 * @param {Function} onstart - A function that is called when the knowledge base creation starts.
 * @param {Function} onfinish - A function that is called when the knowledge base is created.
 * @param {Function} onUserError - Error function.
 * @param {Function} onDevError - Error function.
 * @param {Object} [knowledgeBase={}] - The knowledge base.
 * @param {Number} [idx=0] - The index.
 * @returns {void}
 */
export function createKnowledgeBase (parcelData, services, onstart, onfinish, onUserError, onDevError, knowledgeBase = {}, idx = 0) {
    const key = Object.keys(services)[idx],
        config = services[key];

    if (typeof config === "undefined") {
        onfinish(knowledgeBase);
        return;
    }

    if (typeof onstart === "function" && typeof config?.onstart === "string") {
        onstart(config?.onstart);
    }

    collectFeatures(parcelData, config, getLayerWhere({id: config.layerId}), features => {
        if (features.length === 0) {
            config.propertyName.forEach(attributeKey => {
                knowledgeBase[key + "." + attributeKey] = undefined;
            });
            createKnowledgeBase(parcelData, services, onstart, onfinish, onUserError, onDevError, knowledgeBase, idx + 1);
        }
        else if (config?.precompiler?.type === "allFeaturesByDuration") {
            createKnowledgeBase(parcelData, services, onstart, onfinish, onUserError, onDevError, knowledgeBase, idx + 1);
        }
        else if (config?.precompiler?.type === "nextGroupedFeaturesByDistance") {
            createKnowledgeBase(parcelData, services, onstart, onfinish, onUserError, onDevError, knowledgeBase, idx + 1);
        }
        else if (config?.precompiler?.type === "nextFeatureByDistance") {
            createKnowledgeBase(parcelData, services, onstart, onfinish, onUserError, onDevError, knowledgeBase, idx + 1);
        }
        else {
            const attributes = createAttributesByFeatures(features, config.propertyName);

            Object.entries(attributes).forEach(([attributeKey, attributeValue]) => {
                knowledgeBase[key + "." + attributeKey] = attributeValue;
            });
            createKnowledgeBase(parcelData, services, onstart, onfinish, onUserError, onDevError, knowledgeBase, idx + 1);
        }
    }, error => {
        onDevError(error);
        onUserError(config?.onerror);
        createKnowledgeBase(parcelData, services, onstart, onfinish, onUserError, onDevError, knowledgeBase, idx + 1);
    });
}

/**
 * Creates an attribute object by the passed propertyNames and gets the value from the feature(s).
 * @param {ol/Feature[]} features - The features.
 * @param {String[]} propertyNames - The names of the required attributes of the feature.
 * @returns {Object} The attribute object.
 */
export function createAttributesByFeatures (features, propertyNames) {
    const attributes = {};

    features.forEach(feature => {
        propertyNames.forEach(name => {
            if (!Array.isArray(attributes[name])) {
                attributes[name] = [];
            }
            attributes[name].push(feature.get(name));
        });
    });
    return attributes;
}
