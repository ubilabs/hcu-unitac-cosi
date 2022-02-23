
const actions = {

    setPosition ({dispatch, rootGetters}, evt) {
        if (evt) {
            const projection = rootGetters["Map/ol2DMap"].getView().getProjection().getCode();

            try {
                dispatch("MapMarker/placingPointMarker", evt, {root: true});
                StreetSmartApi.open(
                    {
                        coordinate: [evt[0], evt[1]]
                    },
                    {
                        viewerType: [StreetSmartApi.ViewerType.PANORAMA],
                        srs: projection,
                        panoramaViewer: {replace: true}
                    }).then(
                    function (result) {
                        if (result && result[0]) {
                            console.log("Opened a panorama viewer through API!", result[0]);
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

    initApi ({state, dispatch, rootGetters}) {
        const service = rootGetters.getRestServiceById(state.serviceId),
            projection = rootGetters["Map/ol2DMap"].getView().getProjection().getCode();

        if (service) {
            StreetSmartApi.init({
                targetElement: document.getElementById("streetsmart"),
                username: service.params.username,
                password: service.params.password,
                apiKey: service.params.apiKey,
                srs: projection,
                locale: service.params.locale,
                configurationUrl: service.params.configurationUrl
            })
                .then(
                    function () {
                        StreetSmartApi.on(StreetSmartApi.Events.viewer.VIEWER_ADDED, viewerEvent => {
                            viewerEvent.detail.viewer.on(StreetSmartApi.Events.panoramaViewer.RECORDING_CLICK, function (e) {
                            // move mapMarker, if marker in streetview walks
                                dispatch("MapMarker/placingPointMarker", e.detail.recording.xyz, {root: true});
                            });
                        });
                        dispatch("setPosition", rootGetters["Map/ol2DMap"].getView().getCenter());
                    }
                ).catch(
                    function (reason) {
                        console.log("Failed to create component(s) through API: " + reason);
                    }
                );
        }
    }
};

export default actions;
