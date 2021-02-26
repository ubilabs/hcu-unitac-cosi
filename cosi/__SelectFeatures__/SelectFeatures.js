import {generateSimpleMutations, generateSimpleGetters} from "../../../src/app-store/utils/generators";
import GeometryCollection from "ol/geom/GeometryCollection";

const initialState = {
    id: "SelectFeatures",
    title: "Features Auswählen",
    name: "Features Auswählen",
    glyphicon: "glyphicon-picture",
    isVisibleInMenu: true,
    selectedFeatures: [],
    selectionPolygonGeometries: [],
    bboxGeometry: null,
    featureLayers: [
        {
            name: "",
            id: "",
            selector: ""
        }
    ],
    buffer: 2000,
    activeLayerId: "",
    strokeWidth: 6,
    toggleNoneActiveLayers: true
};

export default {
    namespaced: true,
    state: {
        ...initialState
    },

    mutations: {
        ...generateSimpleMutations(initialState)
    },

    getters: {
        ...generateSimpleGetters(initialState),
        getActiveSelector (state) {
            return state.featureLayers.find(layer => layer.id === state.activeLayerId)?.selector;
        },
        getActiveLayerName (state) {
            return state.featureLayers.find(layer => layer.id === state.activeLayerId)?.name;
        },
        getLayer: state => str => {
            return state.featureLayers.find(layer => layer.name === str || layer.selector === str || layer.id === str);
        },
        title: state => state.name,
        bbox: state => {
            const geometries = [].concat(state.selectedFeatures.map(f => f.getGeometry()), state.selectionPolygonGeometries);

            if (geometries.length > 0) {
                return new GeometryCollection(geometries).getExtent();
            }
            return undefined;

        }
    },

    actions: {
        generateBboxGeometry ({state, commit}) {
            commit("setBboxGeometry", state.selectedFeatures.map(f => f.getGeometry().getCoordinates()[0]));
        }
    }
};
