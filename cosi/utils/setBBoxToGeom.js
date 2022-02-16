import getClusterSource from "./getClusterSource";

/**
 * quick fix for VectorLayer BBox
 * @todo refactor to vuex store action
 * @param {module:ol/geom/GeometryCollection} bboxGeometry - the geometry to set the bounding box to
 * @returns {void}
 */
export function setBBoxToGeom (bboxGeometry) {
    // const layerlist = Radio.request("Parser", "getItemsByAttributes", {typ: "WFS", isBaseLayer: false}).concat(Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON", isBaseLayer: false}));
    const layerlist = [
        ...Radio.request("Parser", "getItemsByAttributes", {typ: "WFS", isBaseLayer: false}),
        ...Radio.request("Parser", "getItemsByAttributes", {typ: "GeoJSON", isBaseLayer: false})
        // ...Radio.request("Parser", "getItemsByAttributes", {typ: "SensorThings", isBaseLayer: false})
    ];

    setBboxGeometryToLayer(layerlist, bboxGeometry);
}

/**
 * sets the bbox geometry for targeted raw layers or exisiting vector layers
 * @param {Array} itemList - list of target raw layers
 * @param {GeometryCollection} bboxGeometry - target geometry to be set as bbox
 * @returns {void}
 */
export function setBboxGeometryToLayer (itemList, bboxGeometry) {
    const modelList = Radio.request("ModelList", "getCollection");

    itemList.forEach(function (item) {
        const model = modelList.get({id: item.id});

        // layer already exists in the model list
        if (model) {
            const source = getClusterSource(model.layer);
            let url = `${model.attributes.url}?service=WFS&version=${model.attributes.version}&request=GetFeature&typeName=${model.attributes.featureType}&srsName=EPSG:25832`;

            url += bboxGeometry ? `&bbox=${bboxGeometry.getExtent().toString()}` : "";

            if (source) {
                source.setUrl(url);

                // remove old listener -> necessary since the listener is an anonymous function
                if (source.getListeners("featuresloadend")) {
                    delete source.listeners_.featuresloadend;
                }

                source.clear();
                source.refresh();

                if (bboxGeometry) {
                    source.on("featuresloadend", function (evt) {
                        evt.target.forEachFeature(feature => {
                            if (feature.getGeometry() !== undefined && !bboxGeometry.intersectsExtent(feature.getGeometry().getExtent())) {
                                evt.target.removeFeature(feature);
                            }
                        });
                    });
                }
            }
        }
        // for layers that are not yet in the model list
        else {
            item.bboxGeometry = bboxGeometry;
        }
    });
}

export default setBBoxToGeom;
