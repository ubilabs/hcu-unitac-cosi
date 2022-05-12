import resultTemplate from "text-loader!./resultTemplate.html";
import store from "../../../../src/app-store";

const ReachabilityResultView = Backbone.View.extend(/** @lends ReachabilityResultView.prototype */{
    /**
     * @class ReachabilityResultView
     * @extends Backbone.View
     * @memberof Tools.Reachability.ReachabilityFromPoint
     * @constructs
     * @fires Core#RadioTriggerMapViewSetCenter
     * @fires Dashboard#RadioTriggerDashboardAppend
     */
    events: {
        "click .isochrone-origin": "zoomToOrigin",
        "click #show-in-dashboard": "showInDashboard",
        "click button.open": "toggleGroup",
        "click .name-tag": "zoomToFacility"
    },
    model: {},
    template: _.template(resultTemplate),

    /**
     * Render to DOM
     * @return {ReachabilityFromPointView} returns this
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.delegateEvents();
        return this;
    },

    /**
     * sets viewport center to the isochrone
     * @param {object} evt - click event
     * @fires Core#RadioTriggerMapViewSetCenter
     * @return {void}
     */
    zoomToOrigin: function (evt) {
        const coord = [parseFloat(evt.target.value.split(",")[0].trim()), parseFloat(evt.target.value.split(",")[1].trim())];

        store.dispatch("MapMarker/placingPointMarker", coord);
        Radio.trigger("MapView", "setCenter", coord);
    },

    /**
     * sends result to dashboard
     * @fires Dashboard#RadioTriggerDashboardAppend
     * @return {void}
     */
    showInDashboard: function () {
        Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
            id: "reachability",
            name: "Erreichbarkeit ab einem Referenzpunkt",
            glyphicon: "bi-signpost-split-fill",
            scalable: true
        });
        this.$el.find("#dashboard-container").empty();
    },

    /**
     * shows facility group table rows
     * @param {object} evt click event
     * @return {void}
     */
    toggleGroup: function (evt) {
        const layerName = this.$(evt.target).attr("id"),
            tr = this.$el.find(`#${layerName}_tr`);

        if (tr.css("display") === "none") {
            tr.show();
        }
        else {
            tr.hide();
        }
    }
});

export default ReachabilityResultView;
