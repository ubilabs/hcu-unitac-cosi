import store from "../../src/app-store";
import {getWmsFeaturesByMimeType} from "../../src/modules/map/store/actions/getWmsFeaturesByMimeType";

Radio.channel("GFI").on({
    "layerAtPosition": async function (layerId, coordinate) {
        store.commit("Map/setGfiFeatures", null);

        const layerList = store.getters["Map/layerList"],
            resolution = store.getters["Map/resolution"],
            projection = store.getters["Map/projection"],
            foundLayer = layerList.find(function (layer) {
                return layer.get("id") === layerId;
            }),
            mimeType = foundLayer.get("infoFormat"),
            layerName = foundLayer.get("name"),
            gfiTheme = foundLayer.get("gfiTheme") || "default",
            gfiAttributes = foundLayer.get("gfiAttributes"),
            gfiParams = {
                INFO_FORMAT: mimeType,
                FEATURE_COUNT: foundLayer.get("featureCount")
            },
            url = foundLayer.getSource().getFeatureInfoUrl(coordinate, resolution, projection, gfiParams),
            gfiAsNewWindow = foundLayer.get("gfiAsNewWindow"),
            feature = await getWmsFeaturesByMimeType(mimeType, url, layerName, gfiTheme, gfiAttributes, gfiAsNewWindow);

        store.commit("Tools/Gfi/setActive", true);
        store.commit("Map/setClickCoord", [coordinate[0], coordinate[1]]);
        store.commit("Map/setGfiFeatures", feature);
    }
});
