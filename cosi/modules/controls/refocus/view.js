import RefocusTemplate from "text-loader!./template.html";
import "./style.less";
import store from "../../../../../src/app-store";

const RefocusView = Backbone.View.extend(/** @lends RefocusView.prototype */{
    events: {
        "click .glyphicon": "refocus"
    },
    /**
     * @class RefocusView
     * @extends ackbone.View
     * @memberof Controls.Refocus
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("Map");

        this.render();
        this.mapChange(Radio.request("Map", "getMapMode"));
        channel.on({
            "change": this.mapChange
        }, this);
    },
    template: _.template(RefocusTemplate),

    /**
     * Render Function
     * @returns {RefocusView} - Returns itself
     */
    render: function () {
        this.$el.html(this.template);
        return this;
    },


    /**
     * refocus map view to selected districts
     * @fires SelectDistrict#RadioTriggerSelectDistrictSetMapViewToBbox
     * @returns {void}
     */
    refocus: function () {
        if (store.getters["Tools/DistrictSelector/extent"].length > 0) {
            const extent = store.getters["Tools/DistrictSelector/extent"];

            store.dispatch("Map/zoomTo", extent);
        }
    },

    /**
     * Shows refocus buttons if map is in 2d-mode.
     * Hides refocus buttons if map is in 3d-mode.
     * @param {String} map Mode of the map. Possible values are "2D" or "3D".
     * @returns {void}
     */
    mapChange: function (map) {
        if (map === "2D") {
            this.$el.show();
        }
        else {
            this.$el.hide();
        }
    }
});

export default RefocusView;
