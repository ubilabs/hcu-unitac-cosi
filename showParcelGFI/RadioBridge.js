import store from "../../src/app-store";
import {getWmsFeaturesByMimeType} from "../../src/api/gfi/getWmsFeaturesByMimeType";

Radio.channel("GFI").on({
    "layerAtPosition": async function (layerId, attributes) {
        store.commit("Maps/setGfiFeatures", null);

        const coordinate = attributes.coordinate,
            layerList = store.getters["Map/layerList"],
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
            features = await getWmsFeaturesByMimeType(foundLayer, url),
            targetFeature = features.find(feature => {
                const properties = feature.getProperties();

                return properties.gemarkung === attributes.gemarkung &&
                    properties.flurstueck.replace(" ", "") === attributes.flurstuecksnummer;
            });

        store.commit("Tools/Gfi/setActive", true);
        store.commit("Maps/setClickCoord", [coordinate[0], coordinate[1]]);
        store.commit("Maps/setGfiFeatures", [targetFeature]);
    }
});
