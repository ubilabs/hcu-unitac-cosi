import Schulwegrouting from "../schulwegrouting/model";
import template from "text-loader!./template.html";
import templateHitlist from "text-loader!./templateHitlist.html";
import templateRouteResult from "text-loader!./templateRouteResult.html";
import templateRouteDescription from "text-loader!./templateRouteDescription.html";
import SnippetCheckBoxView from "../../modules/snippets/checkbox/view";
import "bootstrap-toggle";
import "bootstrap-select";
import "./style.less";

const SchulwegroutingView = Backbone.View.extend(/** @lends SchulwegroutingView.prototype */{
    events: {
        "keyup .address-search": "searchAddress",
        "click li.street": function (evt) {
            this.setAddressSearchValue(evt, true);
            this.$el.find(".address-search").focus();
            evt.stopPropagation();
        },
        "click li.address": function (evt) {
            const address = evt.target.textContent;

            this.setAddressSearchValue(evt, false);
            this.model.selectStartAddress(address, this.model.get("addressListFiltered"));
            this.model.findRegionalSchool(this.model.get("startAddress"));
            this.model.prepareRequest(this.model.get("startAddress"));
        },
        "click .address-search": function (evt) {
            // stop event bubbling
            evt.stopPropagation();
        },
        "click": "hideHitlist",
        "focusin .address-search": "showHitlist",
        "click .close": "closeView",
        // Fires after the select's value (schoolList) has been changed
        "changed.bs.select": "selectSchool",
        "click .delete-route": "resetRoute",
        "click .print-route": "printRoute",
        "click .description button": "toggleRouteDesc",
        "click #regional-school": function () {
            if (this.model.get("regionalSchool")) {
                this.updateSelectedSchool(this.model.get("regionalSchool"));
                this.model.selectSchool(this.model.get("schoolList"), this.model.get("regionalSchool").get("schul_id"));
                this.model.prepareRequest(this.model.get("startAddress"));
            }
        }
    },

    /**
     * @class SchulwegroutingView
     * @extends Backbone.View
     * @memberof Addons.Schulwegrouting
     * @constructs
     */
    initialize: function () {
        const attributes = Radio.request("ModelList", "getModelByAttributes", {id: "schulwegrouting"}).attributes;

        attributes.renderToWindow = false;

        this.model = new Schulwegrouting(attributes);
        this.checkBoxHVV = new SnippetCheckBoxView({model: this.model.get("checkBoxHVV")});
        if (this.model.get("isActive")) {
            this.render();
        }
        this.listenTo(this.model, {
            "change:routeResult": this.renderRouteResult,
            "change:routeDescription": this.renderRouteDescription,
            "change:streetNameList": this.renderHitlist,
            "change:addressListFiltered": this.renderHitlist,
            "renderHitlist": this.renderHitlist,
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    this.render();
                }
                else {
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            },
            "change:currentLng": function () {
                if (this.model.get("isActive")) {
                    this.rerender();
                }
            },
            "updateRegionalSchool": this.updateRegionalSchool,
            "updateSelectedSchool": this.updateSelectedSchool,
            "resetRouteResult": this.resetRouteResult,
            "togglePrintEnabled": this.togglePrintEnabled,
            "render": function () {
                this.$el.remove();
                this.render();
            }
        });
        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    className: "schulweg-routing",
    template: _.template(template),
    templateHitlist: _.template(templateHitlist),
    templateRouteResult: _.template(templateRouteResult),
    templateRouteDescription: _.template(templateRouteDescription),

    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.renderRouteResult(this.model, this.model.get("routeResult"));
        this.renderRouteDescription(this.model, this.model.get("routeDescription"));
        this.updateRegionalSchool(this.model.get("schoolWithAdress"));
        this.togglePrintEnabled(this.model.get("printRoute"));
        this.initSelectpicker();
        this.setPresetValues();
        this.$el.find(".routing-checkbox").append(this.checkBoxHVV.render().$el);
        Radio.trigger("Sidebar", "append", this.el, false, 450);
        Radio.trigger("Sidebar", "toggle", true);
        this.delegateEvents();

        return this;
    },
    /**
     * Rerender method that keeps state except for language.
     * To be used on changeLang.
     * @returns {void}
     */
    rerender: function () {
        const attr = this.model.toJSON(),
            startAddress = this.model.get("startAddress");

        if (Object.keys(startAddress).length === 0) {
            document.getElementsByClassName("address-search")[0].placeholder = attr.startingAddress;
            document.getElementsByClassName("filter-option")[0].innerHTML = attr.selectSchool;
        }
        document.getElementsByClassName("tool-name")[0].innerHTML = attr.name;
        document.getElementsByClassName("regionalPrimarySchool")[0].innerHTML = attr.regionalPrimarySchool;
        document.getElementsByClassName("print-route")[0].innerHTML = attr.printRoute;
        document.getElementsByClassName("delete-route")[0].innerHTML = attr.deleteRoute;

        this.renderRouteResult(this.model, this.model.get("routeResult"));
        this.renderRouteDescription(this.model, this.model.get("routeDescription"));
    },

    togglePrintEnabled: function (value) {
        if (value) {
            this.$el.find(".print-route").removeAttr("disabled");
            this.model.setPrintRoute(true);
        }
        else {
            this.$el.find(".print-route").attr("disabled", true);
            this.model.setPrintRoute(false);
        }
    },

    setPresetValues: function () {
        const school = Object.keys(this.model.get("selectedSchool")).length === 0 ? undefined : this.model.get("selectedSchool");

        this.setStartAddress();
        if (school !== undefined) {
            this.updateSelectedSchool(school);
        }
    },

    setStartAddress: function () {
        const startAddress = this.model.get("startAddress");
        let startStreet = "";

        if (Object.keys(startAddress).length !== 0) {
            startStreet = startAddress.name;

            if (startStreet !== undefined) {
                this.$el.find(".address-search").attr("value", startStreet);
            }
        }
    },

    initSelectpicker: function () {
        this.$el.find(".selectpicker").selectpicker({
            width: "100%",
            selectedTextFormat: "value",
            size: 6
        });
    },

    /**
     * Renders the list with the hits new.
     * @returns {void}
     */
    renderHitlist: function () {
        const attr = this.model.toJSON();

        this.$el.find(".hit-list").html(this.templateHitlist(attr));
    },

    renderRouteResult: function (model, value) {
        const attr = model.toJSON();

        if (Object.keys(value).length !== 0) {
            this.$el.find(".result").html(this.templateRouteResult(attr));
        }
    },

    renderRouteDescription: function (model, value) {
        const attr = model.toJSON();

        if (value.length > 0) {
            this.$el.find(".description").html(this.templateRouteDescription(attr));
        }
    },

    hideHitlist: function () {
        this.$el.find(".hit-list").hide();
    },

    showHitlist: function () {
        this.$el.find(".hit-list").show();
    },

    /**
     * Triggers the search for an address based on the entered string.
     * @param {event} evt key up event contains the entered string
     * @returns {void}
     */
    searchAddress: function (evt) {
        const evtValue = evt.target.value;
        let targetList;

        if (evtValue.length > 2) {
            this.model.searchAddress(evtValue);
        }
        else {
            this.model.setAddressListFiltered([]);
        }

        // necessary to find the correct house numbers for more results
        if (evtValue.slice(-1) === " ") {
            targetList = this.model.filterStreets(evtValue);
            if (targetList.length === 1) {
                this.model.startSearch(targetList, []);
            }
        }
    },

    setAddressSearchValue: function (evt, searchHouseNumber) {
        const address = evt.target.textContent;

        this.$el.find(".address-search").val(address);
        if (searchHouseNumber) {
            this.model.setStreetNameList([address]);
            this.model.searchHouseNumbers(address);
        }
        else {
            this.model.searchAddress(address);
        }
    },

    closeView: function () {
        this.model.setIsActive(false);
        this.$el.find(".result").empty();
        Radio.trigger("ModelList", "toggleDefaultTool");
    },

    selectSchool: function (evt) {
        const schoolname = evt.target.value;

        this.model.selectSchool(this.model.get("schoolList"), schoolname);
        this.model.prepareRequest(this.model.get("startAddress"));
    },

    updateSelectedSchool: function (school) {
        this.model.setSelectedSchool(school);
        this.$el.find(".selectpicker").selectpicker("val", school.get("schul_id"));
    },

    updateRegionalSchool: function (value) {
        this.$el.find("#regional-school").text(value);
    },

    toggleRouteDesc: function (evt) {
        const oldText = evt.target.innerHTML,
            newText = oldText === this.model.get("showRouteDescription") ? this.model.get("hideRouteDescription") : this.model.get("showRouteDescription");

        evt.target.innerHTML = newText;
    },

    resetRoute: function () {
        this.model.resetRoute();
        this.updateSelectedSchool("");
        this.updateRegionalSchool("");
        this.$el.find(".address-search").val("");
        this.resetRouteResult();
    },

    resetRouteResult: function () {
        this.$el.find(".route-result").html("");
        this.$el.find(".result").html("");
        this.$el.find(".description").html("");

        this.model.setRouteResult({});
        this.model.setRouteDescription([]);
        this.model.setSchoolWithAdress("");
    },

    /**
     * trigger the model to print the route
     * @return {void}
     */
    printRoute: function () {
        this.model.printRouteMapFish();
    }
});

export default SchulwegroutingView;
