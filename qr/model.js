import {Pointer} from "ol/interaction";
import QRCode from "qrcode";

import Tool from "../../modules/core/modelList/tool/model";


const QRModel = Tool.extend(/** @lends QRModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        qrPopup: null,
        placementClickInteraction: null,
        lastClickEvent: null,
        urlSchema: "",
        id: "qr",
        text: "Tippen Sie in die Karte um einen QR-Code passend zur ausgewählten Position zu erzeugen."
    }),

    /**
     * @class QRModel
     * @extends Tool
     * @memberOf Addons.QR
     * @constructs
     * @description Renders the tool windows an qr code popups
     */
    initialize () {
        this.superInitialize();
    },

    /**
     * @param {Pointer} value The pointer instance
     * @return {void}
     */
    setPlacementClickInteraction (value) {
        this.set("placementClickInteraction", value);
    },

    /**
     * @return {Pointer} The pointer instance
     */
    getPlacementClickInteraction () {
        return this.get("placementClickInteraction");
    },

    /**
     * Creates a new click interaction listener and adds it to the map and model
     *
     * @fires Map#addInteraction
     *
     * @return {void}
     */
    addQRPlacementInteraction () {
        this.setPlacementClickInteraction(new Pointer({
            handleDownEvent: evt => {
                this.set("lastClickEvent", evt);
            }
        }));
        Radio.trigger("Map", "addInteraction", this.getPlacementClickInteraction());
    },

    /**
     * Removes the map interaction listener
     *
     * @fires Map#removeInteraction
     *
     * @return {void}
     */
    removeQRPlacementInteraction () {
        Radio.trigger("Map", "removeInteraction", this.getPlacementClickInteraction());
        this.setPlacementClickInteraction(null);
    },

    /**
     * @param {Popup} value The popup instance
     * @return {void}
     */
    setQRPopup (value) {
        this.set("qrPopup", value);
    },

    /**
     * @return {Popup} The popup instance
     */
    getQRPopup () {
        return this.get("qrPopup");
    },

    /**
     * Generates an qr code for the given coordinates with the configured url schema
     * @param {Array}coordinates An array with to entries for lat and lang coords
     * @return {Promise<string>} A promise resolving with the data url as string
     */
    generateQRCodeDataURL (coordinates) {
        const lat = coordinates[0],
            lon = coordinates[1],
            url = this.get("urlSchema").replace("{{LAT}}", lat).replace("{{LON}}", lon);

        return QRCode.toDataURL(url);
    }
});

export default QRModel;
