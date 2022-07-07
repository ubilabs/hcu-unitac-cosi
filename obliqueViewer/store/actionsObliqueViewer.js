import {transform} from "@masterportal/masterportalapi/src/crs";

const actions = {
    initObliqueView ({commit, dispatch, getters, rootGetters}) {
        const iframe = document.getElementById("obliqueIframe");

        dispatch("Maps/registerListener", {type: "click", listener: "setClickCoordinate", listenerType: "commit"}, {root: true});
        iframe.addEventListener("load", () => {
            const observer = new MutationObserver(() => {
                const header = iframe.contentWindow.document.getElementById("header"),
                    mapMenu = iframe.contentWindow.document.getElementsByClassName("vcm-btn-icon single-first maptool-btn vcm-btn-base-default vcm-btn-base-splash-hover vcm-border vcm-border-dye03 vcm-btn-icon-font-default vcm-btn-icon-font-dye01-hover vcm-no-select vcm-btn-map-Oblique")[0],
                    overviewMap = iframe.contentWindow.document.getElementsByClassName("overview-map-wrap")[0],
                    vcs = document.getElementById("obliqueIframe").contentWindow.vcs,
                    map = vcs.vcm.Framework.getInstance().getActiveMap();

                if (map) {
                    map.olMap.on("moveend", () => {
                        const transformedCooridnates = transform("EPSG:4326", "EPSG:25832", map.getViewPointSync().groundPosition);

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

                        commit("setHeading", viewPoint.heading);
                        dispatch("MapMarker/rotatePointMarker", viewPoint.heading, {root: true});
                    });
                }

                if (header) {
                    header.style.display = "none";
                    header.parentElement.style.display = "none";
                    commit("setDefaultMapMarkerStyleId", rootGetters["MapMarker/pointStyleId"]);
                    commit("MapMarker/setPointStyleId", getters.mapMarkerStyleId, {root: true});
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
    onMapClick ({dispatch}, evt) {
        dispatch("setObliqueView", evt.coordinate);
    },
    async setObliqueView ({commit, dispatch, getters}, centerCoordinate) {
        const vcs = document.getElementById("obliqueIframe").contentWindow.vcs,
            coord = [...centerCoordinate],
            framework = vcs.vcm.Framework.getInstance(),
            map = framework.getActiveMap();
        let viewPoint = {};

        commit("setLastCoordinates", coord);
        viewPoint = new vcs.vcm.util.ViewPoint({
            groundPosition: transform("EPSG:25832", "EPSG:4326", coord),
            heading: getters.heading,
            distance: map.getViewPointSync().distance
        });

        await framework.getActiveMap().gotoViewPoint(viewPoint);

        dispatch("MapMarker/placingPointMarker", coord, {root: true});
    },
    setObliqueViewerURL ({commit, getters, rootGetters}, initialCenter) {
        const initalCoordinates = [...initialCenter],
            transformedCoordinates = transform("EPSG:25832", "EPSG:4326", initalCoordinates);
        let startCoordinates = "";


        startCoordinates = transformedCoordinates[0] + ", " + transformedCoordinates[1];
        commit("setObliqueViewerURL", rootGetters.getRestServiceById(getters.serviceId).url + "?groundPosition=" + startCoordinates);
    }
};

export default actions;
