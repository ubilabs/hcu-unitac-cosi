import {transform} from "@masterportal/masterportalapi/src/crs";
import getProxyUrl from "../../../src/utils/getProxyUrl";

const actions = {
    /**
    * initObliqueView creates a click listener at the map. Creates a listener at the olMap in the oblique application when the oblique aerial images have been moved in the sidebar.
    * Removes unwanted html elements once the iframe content has been loaded.
    * Sets the special MapMarker style for the oblique map
    * @returns {void}
    */
    initObliqueView ({commit, dispatch, getters, rootGetters}) {
        const iframe = document.getElementById("obliqueIframe");

        dispatch("Maps/registerListener", {type: "click", listener: "setClickCoordinate", listenerType: "commit"}, {root: true});
        iframe?.addEventListener("load", () => {
            const observer = new MutationObserver(() => {
                const header = iframe.contentWindow.document.getElementById("header"),
                    mapMenu = iframe.contentWindow.document.getElementsByClassName("vcm-btn-icon single-first maptool-btn vcm-btn-base-default vcm-btn-base-splash-hover vcm-border vcm-border-dye03 vcm-btn-icon-font-default vcm-btn-icon-font-dye01-hover vcm-no-select vcm-btn-map-Oblique")[0],
                    overviewMap = iframe.contentWindow.document.getElementsByClassName("overview-map-wrap")[0],
                    vcs = document.getElementById("obliqueIframe").contentWindow.vcs,
                    map = vcs.vcm.Framework.getInstance().getActiveMap(),
                    pixelCoordinate = mapCollection.getMap("2D").getPixelFromCoordinate(rootGetters["Maps/initialCenter"]);

                // mapCollection.getMap("2D").on("moveend", function () {
                //     mapCollection.getMap("2D").getLayers().forEach((layer) => {
                //         if (layer.getProperties().id === "marker_point_layer") {
                //             pixelCoordinate = mapCollection.getMap("2D").getPixelFromCoordinate(rootGetters["Maps/clickCoordinate"]);
                //             commit("Maps/setClickCartesianCoordinate", pixelCoordinate, {root: true});
                //         }
                //     });
                // });
                commit("Maps/setClickCartesianCoordinate", pixelCoordinate, {root: true});

                if (map) {
                    map.olMap.on("moveend", () => {
                        const transformedCooridnates = transform("EPSG:4326", mapCollection.getMapView("2D").getProjection().getCode(), map.getViewPointSync().groundPosition);

                        transformedCooridnates.every((coordinate, index) => {
                            if (Math.round(coordinate) !== Math.round(getters.lastCoordinates[index]) && (coordinate - getters.lastCoordinates[index] > 50 || coordinate - getters.lastCoordinates[index] < -50)) {
                                dispatch("setObliqueView", transformedCooridnates);
                                return false;
                            }
                            return true;
                        });
                    });

                    map.imageChanged.addEventListener(async () => {
                        const viewPoint = await map.getViewPoint();

                        if (viewPoint.heading !== getters.heading) {
                            dispatch("MapMarker/rotatePointMarker", viewPoint.heading, {root: true});
                        }
                        commit("setHeading", viewPoint.heading);
                    });
                }

                if (header) {
                    header.style.display = "none";
                    header.parentElement.style.display = "none";
                    commit("setDefaultMapMarkerStyleId", rootGetters["MapMarker/pointStyleId"]);
                    if (getters.styleId) {
                        commit("MapMarker/setPointStyleId", getters.styleId, {root: true});
                    }
                    dispatch("setObliqueView", rootGetters["Maps/center"]);
                    observer.disconnect();
                }
                if (mapMenu) {
                    mapMenu.style.display = "none";
                }
                if (overviewMap) {
                    overviewMap.style.display = "none";
                }
            });

            observer.observe(iframe.contentDocument, {
                childList: true,
                subtree: true
            });
        });
    },

    /**
    * unregister the map listener. Resets the mapMarker style. Removes the MapMarker.
    * @returns {void}
    */
    resetObliqueViewer ({commit, dispatch, getters}) {
        dispatch("Maps/unregisterListener", {type: "click", listener: "setClickCoordinate", listenerType: "commit"}, {root: true});
        commit("MapMarker/setPointStyleId", getters.defaultMapMarkerStyleId, {root: true});
        dispatch("MapMarker/removePointMarker", null, {root: true});
    },

    /**
    * setObliqueView moves the map marker to the click position and centers the oblique aerial images at the point in the sidebar
    * @param {Array} coordinate the click/center coordinate
    * @returns {void}
    */
    async setObliqueView ({commit, dispatch, getters}, coordinate = []) {
        const vcs = document.getElementById("obliqueIframe")?.contentWindow?.vcs,
            framework = vcs?.vcm?.Framework?.getInstance(),
            map = framework?.getActiveMap();
        let viewPoint = {};

        if (framework && coordinate && Array.isArray(coordinate) && coordinate.length > 1) {
            commit("setLastCoordinates", coordinate);
            if (vcs?.vcm?.util) {
                viewPoint = new vcs.vcm.util.ViewPoint({
                    groundPosition: transform(mapCollection.getMapView("2D").getProjection().getCode(), "EPSG:4326", coordinate),
                    heading: getters.heading,
                    distance: map.getViewPointSync().distance
                });
            }

            await framework?.getActiveMap().gotoViewPoint(viewPoint);

            dispatch("MapMarker/placingPointMarker", coordinate, {root: true});
            dispatch("MapMarker/rotatePointMarker", getters.heading, {root: true});
        }
        else {
            dispatch("Alerting/addSingleAlert",
                "<strong>" + i18next.t("additional:modules.tools.obliqueViewer.frameworkUndefined") + "</strong>"
                + "<br>"
                + "<small>" + i18next.t("additional:modules.tools.obliqueViewer.frameworkUndefinedMessage") + "</small>",
                {root: true}
            );
        }
    },
    /**
    * setObliqueViewerURL gets the initaialCenter coordinate and creates the URL for the Oblique Map
    * @param {Array} initialCenter the initial center coordinate
    * @returns {void}
    */
    setObliqueViewerURL ({commit, getters, rootGetters}, initialCenter) {
        if (initialCenter && Array.isArray(initialCenter) && initialCenter.length > 1) {
            const transformedCoordinates = transform(mapCollection.getMapView("2D").getProjection().getCode(), "EPSG:4326", initialCenter);
            let startCoordinates = "";

            startCoordinates = transformedCoordinates[0] + ", " + transformedCoordinates[1];
            if (document.location.hostname === "localhost") {
                commit("setObliqueViewerURL", getProxyUrl(rootGetters.getRestServiceById(getters.serviceId).url) + "?groundPosition=" + startCoordinates);
            }
            else {
                commit("setObliqueViewerURL", rootGetters.getRestServiceById(getters.serviceId).url + "?groundPosition=" + startCoordinates);
            }
        }
    }
};

export default actions;
