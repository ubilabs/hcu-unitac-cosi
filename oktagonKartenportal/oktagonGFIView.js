import OktagonGetFeatureInformationModel from "./oktagonGFIModel";
import Template from "text-loader!./template.html";
import "./style.less";

const OktagonGetFeatureInformationView = Backbone.View.extend(/** @lends OktagonGetFeatureInformationView.prototype */{
    events: {
        "click #oktagonSubmitButton": "onSubmit",
        "click #oktagonCloseButton": "onClose",
        "click .close": "onClose"
    },
    /**
     * @class OktagonGetFeatureInformationView
     * @description Processes parameters that are specified via the URL.
     * @extends Backbone.View
     * @memberOf Addons.OktagonKartenportal
     * @fires Map#RadioRequestMapRegisterListenerWithPostcompose
     * @fires Sidebar#RadioTriggerSidebarAppend
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @listens OktagonGetFeatureInformationModel#ChangeSubmitURL
     * @constructs
     */
    initialize: function () {
        this.model = new OktagonGetFeatureInformationModel();
        Radio.request("Map", "registerListener", "click", this.onMapClick.bind(this));

        this.render();
        Radio.trigger("Sidebar", "append", this.el);
        this.listenTo(this.model, {
            "change:submitURL": this.render
        });

    },
    id: "oktagon-view",
    template: _.template(Template),
    className: "oktagon",
    /**
     * Renders this view in the sidebar.
     * @fires Sidebar#RadioTriggerSidebarAppend
     * @returns {this} this view
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("returnURL") === "") {
            this.$("#oktagonSubmitButton").prop("disabled", true);
        }
        this.delegateEvents();
        return this;
    },
    /**
     * On map click starts onMapClick in the model.
     * Shows the sidebar
     * @param {Event} evt the click event
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @returns {void}
     */
    onMapClick: function (evt) {
        this.model.onMapClick(evt.coordinate);
        Radio.trigger("Sidebar", "toggle", true);
    },
    /**
     * Opens the submit url in the same window
     * @returns {void}
     */
    onSubmit: function () {
        window.open(this.model.get("submitURL"), "_self");
    },
    /**
     * Hides the sidebar.
     * @fires Sidebar#RadioTriggerSidebarToggle
     * @returns {void}
     */
    onClose: function () {
        Radio.trigger("Sidebar", "toggle", false);
    }
});

export default OktagonGetFeatureInformationView;
