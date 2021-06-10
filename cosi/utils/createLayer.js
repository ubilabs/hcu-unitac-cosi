import store from "../../../src/app-store";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

/**
 * Creates a new vector layer and adds it to the map.
 * If it already exists, this layer is returned.
 * @param {String} name - The name and the id for the layer.
 * @returns {module:ol/layer} The created or the already existing layer.
 */
export default function createLayer (name) {
    const layerList = store.getters["Map/layerList"];

    let resultLayer = layerList.find(layer => {
        return layer.get("name") === name;
    });

    if (typeof resultLayer !== "undefined") {
        return resultLayer;
    }

    resultLayer = new VectorLayer({
        id: name,
        name: name,
        source: new VectorSource(),
        zIndex: 999
    });

    store.commit("Map/addLayerToMap", resultLayer);
    return resultLayer;
}
