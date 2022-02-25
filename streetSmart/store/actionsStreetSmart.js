import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Circle, Fill, Style, Stroke} from "ol/style.js";


const actions = {

    setPosition ({state, commit, dispatch, rootGetters}, evt) {
        if (state.active && evt) {
            const projection = rootGetters["Map/ol2DMap"].getView().getProjection().getCode(),
                coordinates = [evt[0], evt[1]];

            try {
                dispatch("MapMarker/placingPointMarker", coordinates, {root: true});
                // dispatch("addDotsLayerToMap");
                StreetSmartApi.open(
                    {
                        coordinate: coordinates
                    },
                    {
                        viewerType: [StreetSmartApi.ViewerType.PANORAMA],
                        srs: projection,
                        panoramaViewer: {
                            replace: true,
                            timeTravelVisible: false,
                            closable: false,
                            // Show green recording dots
                            recordingsVisible: true
                        }
                    }).then(
                    function (result) {
                        if (result && result[0]) {
                            commit("setLastCoordinates", coordinates);
                        }
                        else {
                            console.log("failed to load panorama viewer data, no results for coordinates:", evt);
                            dispatch("Alerting/addSingleAlert", i18next.t("additional:modules.tools.streetsmart.noData"), {root: true});
                            dispatch("MapMarker/placingPointMarker", state.lastCoordinates, {root: true});
                        }
                    }
                ).catch(
                    function (reason) {
                        console.warn("Error opening panorama viewer: " + reason);
                    }
                );
            }
            catch (e) {
                console.error(e);
            }
        }
    },
    initApi ({state, dispatch, getters, rootGetters}) {
        const service = rootGetters.getRestServiceById(state.serviceId),
            projection = rootGetters["Map/ol2DMap"].getView().getProjection().getCode();
        let locale = getters["currentLocale"];

        if (service) {
            const options = {
                targetElement: document.getElementById("streetsmart"),
                username: service.params.username,
                password: service.params.password,
                apiKey: service.params.apiKey,
                srs: projection,
                locale: locale ? locale :service.params.locale,
            };

            StreetSmartApi.init(options)
                .then(
                    function () {
                        dispatch("onInitSuccess");
                    }
                ).catch(
                    function (reason) {
                        console.warn("Failed to create component(s) through API: " + reason);
                        dispatch("Alerting/addSingleAlert", i18next.t("additional:modules.tools.streetsmart.createViewFailed"), {root: true});
                    }
                );
        }
    },
    destroyApi ({dispatch}) {
        dispatch("MapMarker/removePointMarker", null, {root: true});
        dispatch("removeListener");
        StreetSmartApi.destroy({
            targetElement: document.getElementById("streetsmart")
        });
    },
    addListener ({dispatch, rootGetters}) {
        StreetSmartApi.on(StreetSmartApi.Events.viewer.VIEWER_ADDED, viewerEvent => {
            viewerEvent.detail.viewer.on(StreetSmartApi.Events.panoramaViewer.RECORDING_CLICK, function (e) {
                // move mapMarker, if marker in streetview walks
                dispatch("MapMarker/placingPointMarker", e.detail.recording.xyz, {root: true});
            });
            viewerEvent.detail.viewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, function (e) {
                // rotate mapMarker, if rotate in streetsmart
                const markerPoint = rootGetters["MapMarker/markerPoint"],
                    features = markerPoint.getSource().getFeatures();

                if (features.length > 0) {
                    const feature = features[0],
                        icon = feature.getStyle().getImage().clone();

                    icon.setRotation(e.detail.yaw * Math.PI / 180);
                    feature.getStyle().setImage(icon);
                    markerPoint.getSource().clear(true);
                    markerPoint.getSource().addFeatures([feature]);
                }

            });
            viewerEvent.detail.viewer.on(StreetSmartApi.Events.panoramaViewer.TILE_LOAD_ERROR, function (e) {
                // todo: wann kommt dieser Fehler?
                console.warn(e);
            });
        });
    },
    removeListener ({dispatch, rootGetters}) {
        StreetSmartApi.on(StreetSmartApi.Events.viewer.VIEWER_ADDED, viewerEvent => {
            viewerEvent.detail.viewer.off(StreetSmartApi.Events.panoramaViewer.RECORDING_CLICK, function (e) {
                // move mapMarker, if marker in streetview walks
                dispatch("MapMarker/placingPointMarker", e.detail.recording.xyz, {root: true});
            });
            viewerEvent.detail.viewer.off(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, function (e) {
                // rotate mapMarker, if rotate in streetsmart
                const markerPoint = rootGetters["MapMarker/markerPoint"],
                    features = markerPoint.getSource().getFeatures();

                if (features.length > 0) {
                    const feature = features[0],
                        icon = feature.getStyle().getImage().clone();

                    icon.setRotation(e.detail.yaw * Math.PI / 180);
                    feature.getStyle().setImage(icon);
                    markerPoint.getSource().clear(true);
                    markerPoint.getSource().addFeatures([feature]);
                }

            });
            viewerEvent.detail.viewer.off(StreetSmartApi.Events.panoramaViewer.TILE_LOAD_ERROR, function (e) {
                // todo: wann kommt dieser Fehler?
                console.warn(e);
            });
        });
    },
    onInitSuccess ({dispatch, rootGetters}) {
        dispatch("addListener");
        dispatch("setPosition", rootGetters["Map/ol2DMap"].getView().getCenter());
    },
    addDotsLayerToMap ({state, dispatch, rootGetters}) {
    //     var wfsClient = new WFSLayer({
    //         id:"streetSmartDots",
    //         styleId: "1",
    //         url: "https://atlas.cyclomedia.com/Recordings/wfs",
    //         featureType: "atlas:Recording",
    //         typ: "WFS",
    //         name: "streetSmartDots"
    //    });
        const wfsClient = Radio.request("ModelList", "getModelByAttributes", {id: "streetSmartDots"}),
            //    wfsClient.updateSource();
            //    wfsClient.loadBbox( extent[0],extent[1],extent[2],extent[3], bboxReady, username, password);

            vector = new VectorLayer({
                source: new VectorSource(),
                projection: "EPSG:3857",
                style: new Style({
                    image: new Circle({
                        radius: 5,
                        fill: new Fill({color: "#4060FF", opacity: 0.7}),
                        stroke: new Stroke({color: "#2030DD", width: 1, opacity: 0.7})
                    })
                }),
                visible: true
            });

        // var layerSource = vector.getSource();

        // var recordings = wfsClient.recordingList;

        //     if (recordings.length > 0)
        //     {
        //         var b = [];
        //         for (i=0;i < recordings.length; i++)
        //         {
        //             var rec = recordings[i];
        //             var coord = [rec.lon, rec.lat];
        //             var geom = new Point(coord);
        //             var elem = { geometry: geom };
        //             var feature =  new Feature(elem);
        //             layerSource.addFeature(feature);
        //         }
        //     }

        rootGetters["Map/ol2DMap"].addLayer(vector);
    }
};

export default actions;
