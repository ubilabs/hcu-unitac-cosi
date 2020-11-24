import store from "../../src/app-store";
import {getWmsFeaturesByMimeType} from "../../src/api/gfi/getWmsFeaturesByMimeType";

Radio.channel("GFI").on({
    "layerAtPosition": async function (layerId, coordinate) {
        store.commit("Map/setGfiFeatures", null);

        const layerList = store.getters["Map/layerList"],
            resolution = store.getters["Map/resolution"],
            projection = store.getters["Map/projection"],
            foundLayer = layerList.find(function (layer) {
                return layer.get("id") === layerId;
            }),
            gfiParams = {
                INFO_FORMAT: foundLayer.get("infoFormat"),
                FEATURE_COUNT: foundLayer.get("featureCount")
            },
            url = foundLayer.getSource().getFeatureInfoUrl(coordinate, resolution, projection, gfiParams),
            feature = await getWmsFeaturesByMimeType(foundLayer, url);

        store.commit("Tools/Gfi/setActive", true);
        store.commit("Map/setClickCoord", [coordinate[0], coordinate[1]]);
        store.commit("Map/setGfiFeatures", feature);
    }
});
