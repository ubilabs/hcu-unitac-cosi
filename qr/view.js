import QRToolTemplate from "text-loader!./template.html";
import QRPopupTemplate from "text-loader!./createPopupTemplate.html";
import Popup from "ol-popup";
import QRModel from "./model";
import "./style.less";


const QRView = Backbone.View.extend(/** @lends QRView.prototype */{

    /**
     * @class QRView
     * @extends Backbone.View
     * @memberOf Addons.QR
     * @constructs
     * @description Renders the tool windows an qr code popups
     *
     * @fires Core.ModelList#getModelByAttributes
     *
     */
    initialize () {
        const defaultModel = Radio.request("ModelList", "getModelByAttributes", {id: "qr"});

        this.model = new QRModel(defaultModel.attributes);

        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:lastClickEvent": this.renderQRPopup
        });
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },
    /**
     * Template for the tool window
     */
    template: _.template(QRToolTemplate),

    /**
     * The template for the popup content
     */
    qrPopupTemplate: _.template(QRPopupTemplate),

    /**
     * Render or remove the tool window based on the active state
     * @param {QRModel} model The current model
     * @param {boolean} isActive Whether or not the tool is active
     * @return {QRView} self
     */
    render (model, isActive) {

        if (isActive) {
            this.renderSurface();
            this.model.addQRPlacementInteraction();
        }
        else {
            this.removeSurface();
        }
        return this;
    },

    /**
     * Render the new popup window on a click event
     * @param {QRModel} model The current model
     * @param {object} clickEvent The latest click event with the coordinates of the click on the map
     *
     * @fires Map#addOverlay
     *
     * @return {void}
     */
    renderQRPopup (model, clickEvent) {
        let popup = this.model.getQRPopup();

        if (popup === null) {
            popup = new Popup();
        }
        this.model.setQRPopup(popup);
        Radio.trigger("Map", "addOverlay", popup);
        const qrDataUrlPromise = this.model.generateQRCodeDataURL(clickEvent.coordinate);

        qrDataUrlPromise.then((qrDataUrl) => {
            const popupElement = this.qrPopupTemplate({
                qrDataUrl
            });

            popup.show(clickEvent.coordinate, popupElement);
        });
    },

    /**
     * Render the tool template
     * @return {void}
     */
    renderSurface () {
        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(this.model.toJSON()));
        this.delegateEvents();
    },

    /**
     * Removes the qr code popup and the interaction layer
     *
     * @fires Map#removeOverlay
     *
     * @return {void}
     */
    removeSurface () {
        const popup = this.model.getQRPopup();

        if (popup && popup.isOpened()) {
            Radio.trigger("Map", "removeOverlay", popup);
        }

        this.model.removeQRPlacementInteraction();
    }
});

export default QRView;
