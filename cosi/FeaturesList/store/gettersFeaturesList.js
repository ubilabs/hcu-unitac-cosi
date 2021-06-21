
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import stateFeaturesList from "./stateFeaturesList";

const getters = {
    ...generateSimpleGetters(stateFeaturesList),
    selectedFeatures (state, {selectedFeatureItems}) {
        return selectedFeatureItems.map(item => item.feature);
    },
    featuresList (state, {featuresListItems}) {
        return featuresListItems.map(item => item.feature);
    },
    featureItemByAttributes: (state, {featuresListItems}) => attrs => {
        return featuresListItems.find(item => {
            for (const key in attrs) {
                if (item.feature.get(key) !== attrs[key]) {
                    return false;
                }
            }
            return true;
        });
    },
    featureByAttribute: (state, {featureItemByAttributes}) => attrs => {
        return featureItemByAttributes(attrs)?.feature;
    },
    activeVectorLayerList (state, {flatActiveVectorLayerIdList}, rootState, rootGetters) {
        const layerList = rootGetters["Map/layerList"];

        return layerList.filter(layer => flatActiveVectorLayerIdList.includes(layer.get("id")));
    },
    activeLayerMapping (state, {mapping}, rootState, rootGetters) {
        const layerList = rootGetters["Map/layerList"],
            activeLayerList = layerList.map(layer => layer.get("id"));

        return mapping.reduce((groups, group) => {
            const groupLayers = group.layer.filter(layer => activeLayerList.includes(layer.layerId));

            if (groupLayers.length > 0) {
                return [...groups, {
                    group: group.group,
                    layer: groupLayers
                }];
            }
            return groups;
        }, []);
    },
    flatActiveVectorLayerIdList (state, {activeLayerMapping}) {
        return activeLayerMapping.reduce((list, group) => {
            return [...list, ...group.layer.map(l => l.layerId)];
        }, []);
    },
    flatActiveLayerMapping (state, {activeLayerMapping}) {
        return activeLayerMapping.reduce((list, group) => {
            return [...list, ...group.layer.map(l => ({...l, group: group.group}))];
        }, []);
    },
    layerMapById: (state, {flatActiveLayerMapping}) => id => flatActiveLayerMapping.find(l => l.layerId === id),
    isFeatureDisabled: (state, {disabledFeatureItems}) => feature => disabledFeatureItems.filter(item => item.feature === feature).length > 0
};


export default getters;
