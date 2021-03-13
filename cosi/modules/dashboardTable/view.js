import Template from "text-loader!./template.html";
import TableTemplate from "text-loader!./tableTemplate.html";
import ContextActions from "text-loader!./contextActions.html";
import "./style.less";
import DropdownView from "../../../../modules/snippets/dropdown/view";
import ExportButtonView from "../../../../modules/snippets/exportButton/view";
import store from "../../../../src/app-store";
import exportXlsx from "../../utils/exportXlsx";

const DashboardTableView = Backbone.View.extend(/** @lends DashboardTableView.prototype */ {
    events: {
        "click .district": "zoomToFeature",
        "pointerup tr.has-context": "contextMenuTable",
        "click .select-row": "checkboxSelectRow",
        "click .prop button.open": "toggleTimelineTable",
        "click thead button.open": "toggleGroup",
        "click .btn-reset": "resetDropDown",
        "click .toggle-col": "toggleCol",
        "click .move span": "moveCol",
        "click #export-button button": "exportTable",
        "click #export-button-filtered button": "exportTableFiltered"
    },

    /**
     * initialize the dashboardTableView
     * add utility buttons and dropdown menus
     * @class DashboardTableView
     * @extends Backbone.View
     * @memberof Tools.Dashboard
     * @constructs
     * @returns {void}
     */
    initialize: function () {
        this.exportButtonView = new ExportButtonView({model: this.model.get("exportButtonModel")});
        this.exportFilteredButtonView = new ExportButtonView({model: this.model.get("exportFilteredButtonModel")});
        this.filterDropdownView = new DropdownView({model: this.model.get("filterDropdownModel")});
        this.contextActionsEl = $(this.contextActions());
        this.updateRatioSelection();
        this.addContextMenuEventListeners();

        this.listenTo(this.model, {
            "isReady": this.render,
            "ratioValuesUpdated": this.updateRatioSelection,
            "filterUpdated": this.renderFilter
        });

        // workaround for IE
        this.listenTo(Radio.channel("Dashboard"), {
            "dashboardClose": this.storeEl
        });
    },
    id: "dashboard-table",
    className: "dashboard-table",
    model: {},
    exportButtonView: {},
    exportFilteredButtonView: {},
    filterDropdownView: {},
    template: _.template(Template),
    tableTemplate: _.template(TableTemplate),
    contextActions: _.template(ContextActions),
    contextActionsEl: {},
    elBackup: null,

    /**
     * @description renders the dashboardTable
     * appends it to the dashboard widgets if not exists, or updates it
     * delegates events to the widget
     * @returns {Backbone.View} returns this
     */
    render: async function () {
        const attr = this.model.toJSON();

        if (!Radio.request("InfoScreen", "getIsWindowOpen") || Radio.request("InfoScreen", "getIsInfoScreen")) {
            if (!Radio.request("Dashboard", "getWidgetById", "dashboard") && Radio.request("Dashboard", "dashboardOpen")) {
                this.$el.html(this.template(attr));
                this.$el.find(".filter-dropdown").html(this.filterDropdownView.render().$el);

                Radio.trigger("Dashboard", "append", this.$el, "#dashboard-containers", {
                    id: "dashboard",
                    name: "Übersicht",
                    glyphicon: "glyphicon-stats",
                    append: false,
                    width: "100%",
                    noPrint: true
                });
            }
            // fill in the old element if exists on IE
            else if (window.detectMS() && window.detectMS() <= 11) {
                if (this.elBackup) {
                    this.$el.html(this.elBackup);
                }
            }

            this.$el.find(".table").html(this.tableTemplate(attr));
            this.renderExport();

            // reset the collapsed columns
            this.model.set("inactiveColumns", []);
        }

        this.delegateEvents();

        return this;
    },

    /**
     * renders the export button incl. EventListeners
     * @returns {void}
     */
    renderExport () {
        // this.$el.find("#export-button").html(this.exportButtonView.render().el);
        // this.$el.find("#export-button-filtered").html(this.exportFilteredButtonView.render().el);
    },

    /**
     * @description exports the unfiltered table as XLSX
     * @returns {void}
     */
    exportTable () {
        const filename = this.getExportFilename("CoSI-Dashboard-Datenblatt"),
            data = this.model.get("exportData"),
            options = this.getExportTableOptions(data);

        exportXlsx(data, filename, options);
    },

    /**
     * @description exports the filtered table as XLSX
     * @returns {void}
     */
    exportTableFiltered () {
        const filename = this.getExportFilename("CoSI-Dashboard-Datenblatt (gefiltert)"),
            data = this.model.get("exportDataFiltered"),
            options = this.getExportTableOptions(data);

        exportXlsx(data, filename, options);
    },

    /**
     * @description appends the current date to the filename
     * @param {String} filename - the default filename
     * @returns {String} the filename with appended date
     */
    getExportFilename (filename) {
        const date = new Date().toLocaleDateString("de-DE", {year: "numeric", month: "numeric", day: "numeric"});

        return `${filename}-${date}`;
    },

    /**
     * @description sets the width for the table columns
     * @param {Object[]} json - the data to be exported as array of objects
     * @returns {Object} the table options (width for columns)
     */
    getExportTableOptions (json) {
        if (json.length > 0) {
            const headers = Object.keys(json[0]);

            return {
                colOptions: headers.map(header => {
                    if (header === "Jahr") {
                        return {width: 8};
                    }
                    if (header === "Datensatz") {
                        return {width: 42};
                    }
                    if (header === "Kategorie") {
                        return {width: 25.5};
                    }
                    return {width: 20};
                })
            };
        }

        return undefined;
    },

    /**
     * renders the filter Dropdown
     * @returns {void}
     */
    renderFilter () {
        this.filterDropdownView.render();
    },

    /**
     * updates the view with the currently selected attribute names from the table
     * @returns {$} JQuery-Selection
     */
    updateRatioSelection () {
        const selectionText = this.$el.find("span#row-selection");

        if (this.model.getAttrsForRatio().length === 0) {
            this.contextActionsEl.find("li#selection span.selected").empty();
            this.contextActionsEl.find("li.calculate").addClass("inactive");
            return selectionText.empty();
        }

        if (this.model.getAttrsForRatio().length >= 2) {
            this.contextActionsEl.find("li.calculate").removeClass("inactive");
        }

        this.contextActionsEl.find("li#selection span.selected").html("<br />(" + this.model.getAttrsForRatio().join(" / ") + ")");
        return selectionText.html(`<strong>Auswahl:</strong> ${this.model.getAttrsForRatio()[0] ? this.model.getAttrsForRatio()[0] + " (y)" : ""}${this.model.getAttrsForRatio()[1] ? " / " + this.model.getAttrsForRatio()[1] + " (x)" : ""}`);
    },

    /**
     * Triggers the zoomToDistrict method on the selectDistrict Module
     * @param {*} event the DOM event with the target name
     * @fires SelectDistrict#Radio.TriggerZoomToDistrict
     * @returns {void}
     */
    zoomToFeature (event) {
        const districtName = event.target.innerHTML;

        if (Radio.request("InfoScreen", "getIsInfoScreen")) {
            // Läuft aktuell ins Leere
            Radio.trigger("InfoScreen", "triggerRemote", "SelectDistrict", "zoomToDistrict", districtName);
        }
        else {
            const districtFeatures = store.getters["Tools/DistrictSelector/selectedFeatures"],
                attributeSelector = store.getters["Tools/DistrictSelector/keyOfAttrName"];
            let extent;

            districtFeatures.forEach((feature) => {
                if (feature.getProperties()[attributeSelector] === districtName) {
                    extent = feature.getGeometry().getExtent();
                }
            });
            if (extent) {
                store.dispatch("Map/zoomTo", extent, {padding: [20, 20, 20, 20]});
            }
        }
    },

    /**
     * toggles the timelineTable for a dataset open/closed
     * @param {*} event the click event
     * @returns {void}
     */
    toggleTimelineTable: function (event) {
        event.stopPropagation();
        this.$(event.target).parent(".prop").parent("tr").toggleClass("open");
    },

    /**
     * toggles a table group open/closed
     * @param {*} event the click event
     * @returns {void}
     */
    toggleGroup: function (event) {
        event.stopPropagation();
        const group = this.$(event.target).closest("thead").attr("id");

        this.$el.find(`tbody#${group}`).toggleClass("open");
    },

    /**
     * toggles a table column open/closed
     * adds the column index to the inactiveColumns Array on model to exclude it from calculations
     * @param {*} event the click event
     * @returns {void}
     */
    toggleCol: function (event) {
        event.stopPropagation();

        const cellIndex = event.target.parentNode.cellIndex;

        if (this.model.get("inactiveColumns").includes(cellIndex - 2)) {
            this.model.set("inactiveColumns", this.model.get("inactiveColumns").filter(i => i !== cellIndex - 2));
        }
        else {
            this.model.get("inactiveColumns").push(cellIndex - 2);
        }

        this.$el.find("tr").each(function (index, row) {
            $(row.children[cellIndex]).toggleClass("minimized");
        });

        this.model.prepareExportLink();
    },

    /**
     * triggers the reordering of table columns by index and direction
     * @param {Event} event the click event
     * @returns {void}
     */
    moveCol: function (event) {
        const cellIndex = event.target.parentNode.parentNode.cellIndex - 2,
            direction = event.target.className.includes("move-left") ? 0 : 1;

        this.model.changeTableOrder(cellIndex, direction);
    },

    /**
     * adds the 'bs-placeholder' class to the dropdown,
     * sets the placeholder text and unstyle the district features
     * @returns {void}
     */
    resetDropDown: function () {
        this.model.get("filterDropdownModel").updateSelectedValues([]);
        this.$el.find(".filter-dropdown ul.dropdown-menu > li").removeClass("selected");
    },

    createBarChart () {
        this.model.createBarChart(this.contextActionsEl.find("li#barChart #input-year input").val());
    },

    createLineChartUnscaled () {
        this.model.createLineChart([this.row.find("th.prop").attr("id")], this.row.find("th.prop").text(), false);
    },

    createLineChartScaled () {
        this.model.createLineChart([this.row.find("th.prop").attr("id")], this.row.find("th.prop").text(), true);
    },

    createScatterPlotUnscaled () {
        this.model.createCorrelation(false);
        this.model.deleteAttrsForRatio();
    },

    createScatterPlotScaled () {
        this.model.createCorrelation(true);
        this.model.deleteAttrsForRatio();
    },

    createTimeLine () {
        Radio.trigger("Dashboard", "destroyWidgetById", "time-slider");
        Radio.trigger("TimeSlider", "create", this.row.find("th.prop").text());
    },

    deleteSelection () {
        this.model.deleteAttrsForRatio();
    },

    setNumerator () {
        this.model.addAttrForRatio(this.row.find("th.prop").attr("id"), 0);
    },

    setDenominatpr () {
        this.model.addAttrForRatio(this.row.find("th.prop").attr("id"), 1);
    },

    createRatio () {
        this.model.createRatio();
        this.model.deleteAttrsForRatio();
    },

    /**
     * @description Adds all the event listeners to the context menu
     * @returns {void}
     */
    addContextMenuEventListeners () {
        // Create Bar Chart
        this.contextActionsEl
            .find("li#barChart #input-year button")
            .get(0)
            .addEventListener("pointerup", this.createBarChart.bind(this));

        // Create unscaled Line Chart
        this.contextActionsEl
            .find("li#lineChart #unscaled")
            .get(0)
            .addEventListener("pointerup", this.createLineChartUnscaled.bind(this));

        // Create scaled Line Chart
        this.contextActionsEl
            .find("li#lineChart #scaled")
            .get(0)
            .addEventListener("pointerup", this.createLineChartScaled.bind(this));

        // Create Timeline
        this.contextActionsEl
            .find("li#timeline")
            .get(0)
            .addEventListener("pointerup", this.createTimeLine.bind(this));

        // Delete Selection
        this.contextActionsEl
            .find("li#delete-selection")
            .get(0)
            .addEventListener("pointerup", this.deleteSelection.bind(this));

        // Create new ratio data
        // Add numerator
        this.contextActionsEl
            .find("li#numerator")
            .get(0)
            .addEventListener("pointerup", this.setNumerator.bind(this));

        // Add denominator
        this.contextActionsEl
            .find("li#denominator")
            .get(0)
            .addEventListener("pointerup", this.setDenominatpr.bind(this));

        // Create unscaled Correlation scatterPlot
        this.contextActionsEl
            .find("li#correlation #unscaled")
            .get(0)
            .addEventListener("pointerup", this.createScatterPlotUnscaled.bind(this));

        // Create scaled Correlation scatterPlot
        this.contextActionsEl
            .find("li#correlation #scaled")
            .get(0)
            .addEventListener("pointerup", this.createScatterPlotScaled.bind(this));

        // Create new Data Row
        this.contextActionsEl
            .find("li#ratio")
            .get(0)
            .addEventListener("pointerup", this.createRatio.bind(this));
    },

    /**
     * sets the contextMenu HTML and handles actions
     * @param {*} event the mouseup event on the table
     * @fires ContextMenu#RadioTriggerSetActions
     * @returns {void}
     */
    contextMenuTable: function (event) {
        // return if the checkbox is clicked
        if (event.target.className === "select-row") {
            return;
        }
        this.row = this.$(event.target).closest("tr");

        // only change selection on right click, if not more than one item is selected
        if (!(event.button === 2 && this.model.get("selectedAttrsForCharts").length > 1)) {
            this.selectRow(event, this.row);
        }

        Radio.trigger("ContextMenu", "setActions", this.contextActionsEl, this.row.find("th.prop").text(), "glyphicon-stats");

        // Set the current year for all inputs
        this.contextActionsEl.find("li#barChart #input-year input").val(new Date().getFullYear() - 1);
    },

    /**
     * sets the row selection, or adds a row to existing selection, depending on the event
     * @param {*} event the DOM event
     * @param {string} [_row] (optional) the already parsed row name
     * @returns {void}
     */
    selectRow (event, _row) {
        const row = _row || this.$(event.target).closest("tr"),
            value = row.find("th.prop").attr("id");

        // Add row to selection if ctrl-Key is pressed, or remove it, if already selected
        if (event.ctrlKey) {
            if (this.model.get("selectedAttrsForCharts").includes(value)) {
                this.model.set("selectedAttrsForCharts", this.model.get("selectedAttrsForCharts").filter(val => val !== value));
                row.removeClass("selected");
                row.find(".select-row input").get(0).checked = false;
            }
            else {
                this.model.get("selectedAttrsForCharts").push(value);
                row.addClass("selected");
                row.find(".select-row input").get(0).checked = true;
            }
        }
        else {
            this.model.set("selectedAttrsForCharts", [value]);
            row.parent("tbody").parent("table").find("tr").removeClass("selected");
            row.parent("tbody").parent("table").find(".select-row input").prop("checked", false);
            row.addClass("selected");
            row.find(".select-row input").get(0).checked = true;
        }
    },

    /**
     * handles the selection of rows through the checkbox, triggers selectRow
     * @param {*} event the click event
     * @returns {void}
     */
    checkboxSelectRow (event) {
        event.stopPropagation();
        event.preventDefault();

        event.ctrlKey = true;

        this.selectRow(event);
    },

    /**
     * workaround for IE, storing the Element for later use
     * @returns {void}
     */
    storeEl () {
        const isMs = window.detectMS();

        if (isMs && isMs <= 11) {
            this.elBackup = this.$el.html();
        }
    }
});

export default DashboardTableView;
