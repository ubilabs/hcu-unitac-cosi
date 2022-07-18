import {getLayerWhere} from "@masterportal/masterportalapi/src/rawLayerList";
import axios from "axios";

const actions = {
    /**
     * Iterates over layerIds, creates the url and executes the wfs request.
     * @param {Object} getters vuex element
     * @param {Object} dispatch vuex element
     * @returns {void}
     */
    requestRawLayerList ({getters, dispatch}) {
        getters.layerIds.forEach(async (layerId) => {
            const rawLayer = getLayerWhere({id: layerId}),
                getFeatureUrl = await dispatch("buildAndGetRequestUrl", rawLayer);

            dispatch("sendRequest", getFeatureUrl);
        });

    },

    /**
     * Checks for highlighting layer from zoomTo and removes it.
     * @param {Object} dispatch vuex element
     * @param {String} url url for the wfs request
     * @returns {void}
     */
    sendRequest ({dispatch}, url) {
        axios({
            url: url,
            type: "GET",
            timeout: 6000
        }).then((response) => {
            dispatch("parseFeatures", response.data);
        }).catch(
            dispatch("Alerting/addSingleAlert", url + i18next.t("additional:modules.tools.refugeehomes.requestAlert"), {root: true})
        );
    },

    /**
     * Builds the wfs request from layer information.
     * @param {Object} state vuex element
     * @param {Object} rawLayer wfs layer
     * @returns {String} wfs query string
     */
    buildAndGetRequestUrl (state, rawLayer) {
        const params = "?service=WFS&request=GetFeature&version=2.0.0&typeNames=",
            url = rawLayer.url,
            featureType = rawLayer.featureType;

        return url + params + featureType;
    },

    /**
     * Parses the xml data
     * @param {Object} commit vuex element
     * @param {XML} data xml data
     * @returns {void}
     */
    parseFeatures: function ({getters, dispatch, commit, rootGetters}, data) {
        const xmlData = new DOMParser().parseFromString(data, "text/xml"),
            hits = xmlData.getElementsByTagName("wfs:member");

        let feature,
            element,
            coordEle,
            coord;

        hits.forEach(hit => {
            feature = {
                id: hit.childNodes[1].getAttribute("gml:id")
            };

            getters.featureAttributes.forEach((attr) => {
                element = hit.getElementsByTagName("app:" + attr)[0];

                if (typeof element !== "undefined") {
                    if (attr === "pfad") {
                        const pfadArray = element.innerHTML.split("|");

                        feature[attr] = pfadArray;
                    }
                    else if (attr === "geom") {
                        coordEle = hit.getElementsByTagName("gml:pos")[0];
                        coord = coordEle.innerHTML.split(" ");

                        feature[attr] = [parseFloat(coord[0]), parseFloat(coord[1])];
                    }
                    else {
                        feature[attr] = element.innerHTML;
                    }

                    feature.featureType = hit.childNodes[1].localName;
                    feature.imgSrc = rootGetters.imagePath + feature.featureType + ".svg";
                }
            });
            dispatch("scaleImages", feature);
            commit("addFeature", feature);
        });
    },
    /**
     * Sets the image height depending on the number of seats of a location for image manipulation
     * @param {Object} context vuex element
     * @param {Object} feature wfs feature
     * @returns {void}
     */
    scaleImages (context, feature) {
        const seatNumbers = feature.platzzahl;

        if (seatNumbers === 0) {
            feature.imgHeight = 30;
        }
        else if (seatNumbers < 100) {
            feature.imgHeight = 20;
        }
        else if (seatNumbers >= 250) {
            feature.imgHeight = 30;
        }
        else {
            feature.imgHeight = 25;
        }
        return feature;
    }
};

export default actions;
