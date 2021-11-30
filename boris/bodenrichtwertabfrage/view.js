import initializeBrwAbfrageModel from "../bodenrichtwertabfrage/model";
import * as moment from "moment";
import Template from "text-loader!./template.html";
import TemplateCategoryDetails from "text-loader!./templateCategoryDetails.html";
import TemplateCategoryLage from "text-loader!./templateCategoryLage.html";
import TemplateCategoryUmrechnen from "text-loader!./templateCategoryUmrechnen.html";
import TemplateCategorySchichtwerte from "text-loader!./templateCategorySchichtwerte.html";
import TemplateInfoContainer from "text-loader!./templateInfoContainer.html";
import TemplateLanduseSelect from "text-loader!./templateLanduseSelect.html";
import TemplateLayerSelect from "text-loader!./templateLayerSelect.html";
import TemplateMobileLayerSelect from "text-loader!./templateMobileLayerSelect.html";
import "./style.scss";
import axios from "axios";
import LoaderOverlay from "../../../src/utils/loaderOverlay";

const BrwAbfrageView = Backbone.View.extend({
    events: {
        "click .list-group-item": "handleSelectBRWYear",
        "change #brwLayerSelect": "handleSelectBRWYear",
        "click #brwCategorySelect": "handleClickCategory",
        "change #landuseSelect": "setLanduse",
        "click .print": "preparePrint",
        "change #zBauwSelect": "handleBauwChange",
        "change #zStrassenLageSelect": "handleStrassenLageChange",
        "change #zGeschossfl_zahlInput": "handleGeschossfl_zahlChange",
        "keyup #zGeschossfl_zahlInput": "handleGeschossfl_zahlChange",
        "change #zGrdstk_flaecheInput": "handleGrdstk_flaecheChange",
        "keyup #zGrdstk_flaecheInput": "handleGrdstk_flaecheChange",
        "click button.close": function () {
            Radio.trigger("Sidebar", "toggle", false);
            Radio.trigger("Alert", "alert", {
                text: "Bitte navigieren Sie zum gesuchten Bodenrichtwert bzw. zur -zone und selektieren Sie diesen.",
                kategorie: "alert-success"
            });
        },
        "click .glyphicon-question-sign": "handleHelpButton",
        "click #showStripesInput": "toggleStripesLayer",
        "click .info-icon": "toggleInfoText"
    },
    initialize: function () {
        this.model = initializeBrwAbfrageModel();
        this.listenTo(this.model, {
            "change:isViewMobile": this.handleViewChange,
            "change:selectedBrwFeature": this.render,
            "change:convertedBrw": this.render,
            "change:gfiFeature": this.render,
            "change:selectedCategory": this.render
        });
        this.render(this.model, this.model.get("isActive"));
    },
    id: "boris",
    template: _.template(Template),
    templateCategoryDetails: _.template(TemplateCategoryDetails),
    templateCategoryLage: _.template(TemplateCategoryLage),
    templateCategoryUmrechnen: _.template(TemplateCategoryUmrechnen),
    templateCategorySchichtwerte: _.template(TemplateCategorySchichtwerte),
    templateInfoContainer: _.template(TemplateInfoContainer),
    templateLanduseSelect: _.template(TemplateLanduseSelect),
    templateLayerSelect: _.template(TemplateLayerSelect),
    templateMobileLayerSelect: _.template(TemplateMobileLayerSelect),
    render: function () {
        const attr = this.model.toJSON();

        Radio.trigger("Alert", "alert:remove");
        // must be removed, else IE 11 does not render the template
        this.$el.remove();
        this.$el.html(this.template(attr));
        this.renderLayerlist(attr);
        Radio.trigger("Sidebar", "append", this.el, false, 0.3);
        Radio.trigger("Sidebar", "toggle", true);
        this.delegateEvents();

        return this;
    },

    /**
     * Toggles the attribute "stripesLayer" in model and shows or hides the stripes for the selected year.
     *  @returns {void}
     */
    toggleStripesLayer: function () {
        this.model.toggleStripesLayer(!this.model.get("stripesLayer"));
    },
    /**
     * toggle the info text
     * @returns {void}
     */
    toggleInfoText: function () {
        const isInfoTextVisible = this.$el.find(".info-text").is(":visible");

        if (!isInfoTextVisible) {
            this.$el.find(".info-icon").css("opacity", "1");
            this.$el.find(".form-check").css("margin-bottom", "0");
            this.$el.find(".info-text").show();
        }
        else {
            this.$el.find(".info-icon").css("opacity", "0.4");
            this.$el.find(".form-check").css("margin-bottom", "15px");
            this.$el.find(".info-text").hide();
        }
    },

    /**
     * Zeichnet die Layerlist unterschiedlich für mobil/desktop
     * @param   {object} attr Modelattribute
     * @returns {void}
     */
    renderLayerlist: function (attr) {
        if (!this.model.has("gfiFeature") && this.model.get("isViewMobile")) {
            this.$el.find(".brw-container").append(this.templateMobileLayerSelect(attr));
        }
        else {
            this.$el.find(".brw-container").append(this.templateLayerSelect(attr));
            this.renderLanduse();
        }
    },

    /**
     * Zeichne ggf. landUse Template
     * @param   {object} attr Modelattribute
     * @returns {void}
     */
    renderLanduse: function () {
        const attr = this.model.toJSON();

        if (this.model.has("gfiFeature")) {
            this.$el.find(".brw-container").append(this.templateLanduseSelect(attr));
        }
        if (Object.keys(this.model.get("selectedBrwFeature")).length !== 0) {
            this.renderInfoContainer(attr);
        }
    },

    /**
     * Zeichne ggf. BRW Template
     * @param   {object} attr Modelattribute
     * @returns {void}
     */
    renderInfoContainer: function (attr) {
        this.$el.find(".brw-container").append(this.templateInfoContainer(attr));

        if (this.model.get("selectedCategory") === "Detailinformationen") {
            this.$el.find(".info-container-content").append(this.templateCategoryDetails(attr));
        }
        else if (this.model.get("selectedCategory") === "Lagebeschreibung") {
            this.$el.find(".info-container-content").append(this.templateCategoryLage(attr));
        }
        else if (this.model.get("selectedCategory") === "Umrechnung auf individuelles Grundstück") {
            this.$el.find(".info-container-content").append(this.templateCategoryUmrechnen(attr));
            this.model.setZBauwSelect(this.$el.find("#zBauwSelect").val());
        }
        else if (this.model.get("selectedCategory") === "Schichtwerte") {
            this.$el.find(".info-container-content").append(this.templateCategorySchichtwerte(attr));
        }
    },

    handleBauwChange: function () {
        const text = document.getElementById("zBauwSelect").options[document.getElementById("zBauwSelect").selectedIndex].value;

        this.model.updateSelectedBrwFeature("zBauweise", text);
        this.model.sendWpsConvertRequest();
    },

    handleStrassenLageChange: function () {
        const text = document.getElementById("zStrassenLageSelect").options[document.getElementById("zStrassenLageSelect").selectedIndex].text;

        this.model.updateSelectedBrwFeature("zStrassenLage", text);
        this.model.sendWpsConvertRequest();
    },

    handleGeschossfl_zahlChange: function (evt) {
        if (evt.type === "change" || (evt.key === "Enter" && Radio.request("Util", "isInternetExplorer"))) {
            this.model.updateSelectedBrwFeature("zGeschossfl_zahl", parseFloat(evt.currentTarget.value.replace(",", ".")));
            this.model.sendWpsConvertRequest();
        }
    },

    handleGrdstk_flaecheChange: function (evt) {
        if (evt.type === "change" || (evt.key === "Enter" && Radio.request("Util", "isInternetExplorer"))) {
            this.model.updateSelectedBrwFeature("zGrdstk_flaeche", parseFloat(evt.currentTarget.value.replace(",", ".")));
            this.model.sendWpsConvertRequest();
        }
    },

    /**
     * Regelt das Event von isViewMobile
     * @returns {void}
     */
    handleViewChange: function () {
        this.render(this.model, false);
        this.render(this.model, this.model.get("isActive"));
    },

    /**
     * Aktionen beim Wechseln eines BRW-Jahres aus der Sidebar abhängig von mobil / desktop
     * @param {jQuery.Event} evt - select change event | button click event
     * @returns {void}
     */
    handleSelectBRWYear: function (evt) {
        const selectedLayername = evt.target.value;

        this.model.switchLayer(selectedLayername);
        if (this.model.get("isViewMobile")) {
            Radio.trigger("Alert", "alert", {
                text: "Bitte navigieren Sie zum gesuchten Bodenrichtwert bzw. zur -zone und selektieren Sie diesen.",
                kategorie: "alert-success"
            });
            Radio.trigger("Sidebar", "toggle", false);
        }
        else {
            this.model.checkBrwFeature(this.model.get("brwFeatures"), selectedLayername.split(".")[2]);
            Radio.trigger("Alert", "alert:remove");
            this.render(this.model, this.model.get("isActive"));
        }
    },

    /**
     * Togglet die Visibility des Hinweistextes
     * @param   {evt} evt Event am Glyphicon
     * @returns {void}
     */
    handleHelpButton: function (evt) {
        const helper = this.$el.find(evt.target).parent().next().next();

        if (helper.hasClass("help")) {
            helper.slideToggle();
        }
    },

    /**
     * Prepare print.
     * @returns {void}
     */
    preparePrint: function () {
        LoaderOverlay.show();

        this.model.preparePrint(this.getResponse);
    },

    /**
     * Function for print process.
     * @param {String} url the url for the request
     * @param {Object} payload the payload for the request
     * @returns {void}
     */
    getResponse: async function (url, payload) {
        return axios.post(url, payload);
    },

    /**
     * Toggles the selected Landuse
     * @param {jQuery.Event} evt - select change event
     * @return {void}
     */
    setLanduse: function (evt) {
        const brwLayerSelect = this.$el.find("#brwLayerSelect").find("option:selected").val(),
            selectedBRWLayerYear = moment(brwLayerSelect, "dd.MM.YYYY").format("YYYY"),
            selectedText = evt.target.options[evt.target.selectedIndex].text,
            selectedValue = evt.target.options[evt.target.selectedIndex].value;

        this.model.setBrwLanduse(selectedText);
        this.model.sendGetFeatureRequest(selectedValue, selectedBRWLayerYear);
    },

    /**
     * Aktionen beim Wechseln der Kategorie einer BRW-Information
     * @param   {evt} evt Klickevent
     * @returns {void}
     */
    handleClickCategory: function (evt) {
        this.model.setSelectedCategory(evt.currentTarget.value);
    }
});

export default BrwAbfrageView;
