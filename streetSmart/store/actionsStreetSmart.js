import rotateMarker from "../utils/rotateMarker";
let StreetSmartApi;// kann man das so lösen? linter?

const actions = {

    /**
     * Sets the coordinates of the event to panorama-viewer and sets mapMarker to map.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} evt contains coordinates
     * @returns {void}
     */
    setPosition ({state, commit, dispatch, rootGetters}, evt) {
        if (state.active && evt) {
            const projection = rootGetters["Map/ol2DMap"].getView().getProjection().getCode(),
                coordinates = [evt[0], evt[1]];

            try {
                dispatch("MapMarker/placingPointMarker", coordinates, {root: true});
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
                            dispatch("Alerting/addSingleAlert", i18next.t("additional:modules.tools.streetsmart.noData"), {root: true});
                            dispatch("MapMarker/placingPointMarker", state.lastCoordinates, {root: true});
                        }
                    }
                ).catch(
                    function (reason) {
                        console.warn("Error opening panorama viewer: " + reason);
                        dispatch("Alerting/addSingleAlert", i18next.t("additional:modules.tools.streetsmart.createViewFailed"), {root: true});
                    }
                );
            }
            catch (e) {
                console.error(e);
                dispatch("Alerting/addSingleAlert", i18next.t("additional:modules.tools.streetsmart.createViewFailed"), {root: true});
            }
        }
    },
    /**
     * Initializes the StreetSmartApi Panorama viewer.
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @returns {void}
     */
    initApi ({state, dispatch, getters, rootGetters}) {
        const service = rootGetters.getRestServiceById(state.serviceId),
            projection = rootGetters["Map/ol2DMap"].getView().getProjection().getCode(),
            locale = getters.currentLocale;

        if (service) {
            const options = {
                targetElement: document.getElementById("streetsmart"),
                username: service.params.username,
                password: service.params.password,
                apiKey: service.params.apiKey,
                srs: projection,
                locale: locale ? locale : service.params.locale
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
    /**
     * Destroys the StreetSmartApi Panorama viewer and removes mapMarker from map.
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    destroyApi ({dispatch}) {
        dispatch("MapMarker/removePointMarker", null, {root: true});
        dispatch("removeListener");
        StreetSmartApi.destroy({
            targetElement: document.getElementById("streetsmart")
        });
    },
    /**
     * Moves and rotates the mapMarker.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} param.getters the getters
     * @param {Object} evt to get coordinates and rotation from
     * @returns {void}
     */
    moveAndRotateMarker ({dispatch, rootGetters, getters}, evt) {
        dispatch("MapMarker/placingPointMarker", evt.detail.recording.xyz, {root: true}).then(()=>{
            rotateMarker(rootGetters["MapMarker/markerPoint"], evt.detail.recording.relativeYaw + getters.lastYaw);
        });
    },
    /**
     * Rotates the mapMarker and remembers the last yaw.
     * @param {Object} param.commit the commit
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} evt to get rotation from
     * @returns {void}
     */
    rotateMarker ({commit, rootGetters}, evt) {
        rotateMarker(rootGetters["MapMarker/markerPoint"], evt.detail.yaw);
        commit("setLastYaw", evt.detail.yaw);
    },
    /**
     * Adds listener to panorama viewer.
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    addListener ({dispatch}) {
        StreetSmartApi.on(StreetSmartApi.Events.viewer.VIEWER_ADDED, viewerEvent => {
            viewerEvent.detail.viewer.on(StreetSmartApi.Events.panoramaViewer.RECORDING_CLICK, function (e) {
                dispatch("moveAndRotateMarker", e);
            });
            viewerEvent.detail.viewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, function (e) {
                dispatch("rotateMarker", e);
            });
            viewerEvent.detail.viewer.on(StreetSmartApi.Events.panoramaViewer.TILE_LOAD_ERROR, function (e) {
                // todo: wann kommt dieser Fehler?
                console.warn(e);
            });
        });
    },
    /**
     * Removes listener from panorama viewer.
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    removeListener ({dispatch}) {
        StreetSmartApi.on(StreetSmartApi.Events.viewer.VIEWER_ADDED, viewerEvent => {
            viewerEvent.detail.viewer.off(StreetSmartApi.Events.panoramaViewer.RECORDING_CLICK, function (e) {
                dispatch("moveAndRotateMarker", e);
            });
            viewerEvent.detail.viewer.off(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, function (e) {
                dispatch("rotateMarker", e);
            });
            viewerEvent.detail.viewer.off(StreetSmartApi.Events.panoramaViewer.TILE_LOAD_ERROR, function (e) {
                // todo: wann kommt dieser Fehler?
                console.warn(e);
            });
        });
    },
    /**
     * Is called if initilization of StreetSmartApi was successful.
     * Adds listeners and sets maps center as position in panorama viewer.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @returns {void}
     */
    onInitSuccess ({dispatch, rootGetters}) {
        dispatch("addListener");
        dispatch("setPosition", rootGetters["Map/ol2DMap"].getView().getCenter());
    }
};

export default actions;
