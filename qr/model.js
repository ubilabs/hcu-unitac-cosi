import {Pointer} from "ol/interaction";
import QRCode from "qrcode";
import {transform} from "masterportalapi/src/crs";
import Tool from "../../modules/core/modelList/tool/model";


const QRModel = Tool.extend(/** @lends QRModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        qrPopup: null,
        placementClickInteraction: null,
        lastClickEvent: null,
        urlSchema: "",
        id: "qr",
        text: "Tippen Sie in die Karte um einen QR-Code passend zur ausgewählten Position zu erzeugen.",
        projection: "EPSG:25832"
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
     * Set the popup on the model and add it as overlay to the map
     * @param {Overlay} value The popup instance
     *
     * @fires Map#addOverlay
     *
     * @return {void}
     */
    setQRPopup (value) {
        this.set("qrPopup", value);
        Radio.trigger("Map", "addOverlay", value);
    },

    /**
     * Remove the overlay from the map.
     *
     * @fires Map#removeOverlay
     *
     * @return {void}
     */
    removeQRPopup () {
        Radio.trigger("Map", "removeOverlay", this.getQRPopup());
        this.set("qrPopup", null);
    },

    /**
     * @return {Overlay} The popup instance
     */
    getQRPopup () {
        return this.get("qrPopup");
    },

    /**
     * Generates an qr code for the given coordinates with the configured url schema
     * @param {Array} coordinates An array with two entries for longitude and latitude coordinates in EPSG:25832
     * @return {Promise<string>} A promise resolving with the data url as string
     */
    generateQRCodeDataURL (coordinates) {
        const url = this.replaceDataInURLSchema(coordinates);

        return QRCode.toDataURL(url);
    },

    /**
     * Replaces the placeholders in the configured url schema with the given coordinates
     * @param {Array} coordinates An array with two entries for longitude and latitude coordinates in EPSG:25832
     * @return {string} The data url as string
     */
    replaceDataInURLSchema (coordinates) {
        const transformedCoords = this.transformCoords(coordinates),
            lat = transformedCoords[1],
            lon = transformedCoords[0],
            url = this.get("urlSchema").replace("{{LAT}}", lat).replace("{{LON}}", lon);

        return url;
    },

    /**
     * Transform the coordinates to the specified target projection
     *
     * @param {number[]} coordinates The coordinates to transform
     * @return {number[]} The transformed coordinates
     */
    transformCoords (coordinates) {
        return transform("EPSG:25832", this.get("projection"), coordinates);
    }
});

export default QRModel;
