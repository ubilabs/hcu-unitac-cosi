import ResultTemplate from "text-loader!./resultTemplate.html";

const ResultView = Backbone.View.extend(/** @lends ResultView.prototype */{
    /**
     * @class ResultView
     * @extends Backbone.View
     * @memberof Addons.Einwohnerabfrage
     * @constructs
     */
    model: {},

    /**
     * @member ResultTemplate
     * @description Template used to create Resultview for Einwohnerabfrage
     * @returns {void}
     */
    template: _.template(ResultTemplate),

    /**
     * Renders the result view.
     * @returns {void}
     */
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    }
});

export default ResultView;
