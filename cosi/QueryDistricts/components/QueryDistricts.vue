<script>
import Vue from "vue";
import {mapGetters, mapMutations, mapActions} from "vuex";
import Tool from "../../../../src/modules/tools/Tool.vue";
import getters from "../store/gettersQueryDistricts";
import mutations from "../store/mutationsQueryDistricts";
import {getLayerList as _getLayerList} from "masterportalAPI/src/rawLayerList";
import compareFeatures from "./compareFeatures.js";
import LayerFilter from "./LayerFilter.vue";
import DashboardResult from "./DashboardResult.vue";
import Info from "text-loader!./info.html";
import {Fill, Stroke, Style} from "ol/style.js";
import {getAllFeatures as _getAllFeatures} from "../utils/getAllFeatures.js";
import exportXlsx from "../../utils/exportXlsx";
import * as Extent from "ol/extent";
import * as turf from "@turf/turf";
import renameKeys from "../../utils/renameKeys.js";

export default {
    name: "QueryDistricts",
    components: {
        Tool,
        LayerFilter
    },
    data () {
        return {
            selectedDistrict: null,
            allLayerOptions: [],
            layerOptions: [],
            selectedLayer: null,
            districtNames: [],
            layerFilterModels: [],
            selectorField: "verwaltungseinheit",
            resultNames: null,
            results: null,
            refDistrict: null,
            dashboard: null,
            facilityNames: [],
            propertiesMap: {},
            resultTableHeaders: null
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/QueryDistricts", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", [
            "keyOfAttrName",
            "selectedFeatures",
            "layer",
            "keyOfAttrNameStats",
            "selectedDistrictLevel",
            "mapping"
        ]),
        ...mapGetters("Tools/FeaturesList", ["isFeatureDisabled", "layerMapById"]),
        ...mapGetters("Map", ["layerById"])
    },
    watch: {
        async layerFilterModels () {
            this.computeResults();
        },

        async selectedDistrict () {
            const newModels = [];

            for (const m of this.layerFilterModels) {
                const newModel = {...m};

                newModels.push(newModel);
                this.setLayerFilterModelValue(newModel);
            }
            this.layerFilterModels = newModels;
        },

        facilityNames () {
            this.setLayerOptions();
        },

        active (value) {
            if (value) {
                this.initializeDistrictNames();
                this.setLayerOptions();
            }
        }
    },

    created () {
        this.$on("close", this.close);
        Radio.on("ModelList", "updatedSelectedLayerList", this.setFacilityNames.bind(this));
    },

    async mounted () {
        this.applyTranslationKey(this.name);
        this.mapLayer = await this.createLayer("query-districts");
    },
    methods: {
        ...mapMutations("Tools/QueryDistricts", Object.keys(mutations)),
        ...mapMutations("Tools/DistrictSelector", ["setSelectedDistrictsCollection"]),
        ...mapActions("Tools/DistrictSelector", ["setDistrictsByName"]),
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        ...mapActions("Map", ["zoomTo", "createLayer"]),
        ...compareFeatures,

        initializeDistrictNames: function () {
            const selector = this.keyOfAttrName;

            if (this.selectedFeatures?.length) {
                this.districtNames = this.selectedFeatures.map(
                    (feature) => feature.getProperties()[selector]
                ).sort();
            }
            else {
                this.districtNames = this.layer
                    .getSource()
                    .getFeatures()
                    .map((district) => district.getProperties()[selector])
                    .sort();
            }

            this.districtNames = [...new Set(this.districtNames)];
        },

        getLayerList: function () {
            return _getLayerList();
        },

        getAllFeatures: async function (id) {
            const features = await _getAllFeatures(id);

            return features.length > 0
                ? features
                : this.layerById(id).olLayer.getSource().getFeatures();
        },

        setLayerOptions: function () {
            const url = this.selectedDistrictLevel.stats.baseUrl[0], /** @todo allow multiple sources */
                layers = this.getLayerList()
                    .filter(layer=> layer.url === url);

            this.allLayerOptions = [];

            for (const m of this.mapping) {
                const layer = layers.find(l=>l.id && l.id === m[this.keyOfAttrNameStats]);

                if (layer) {
                    this.allLayerOptions.push({
                        name: m.value,
                        id: layer.id,
                        group: m.group,
                        valueType: m.valueType
                    });
                }
            }

            for (const facilityLayer of this.facilityNames) {
                this.allLayerOptions.push({
                    name: facilityLayer.name,
                    id: facilityLayer.id,
                    group: this.$t("additional:modules.tools.cosi.queryDistricts.funcData"),
                    valueType: "absolute",
                    facilityLayerName: facilityLayer.name
                });
            }
            this.updateAvailableLayerOptions();
        },

        updateAvailableLayerOptions () {
            const layerOptions = this.allLayerOptions.filter(
                    layer => this.layerFilterModels.find(model => model.layerId === layer.id) === undefined
                ),
                groups = layerOptions.reduce((acc, el)=> ({...acc, [el.group]: [...acc[el.group] || [], el]}), {});

            let ret = [];

            for (const g in groups) {
                ret.push({header: g});
                ret = ret.concat(groups[g]);
            }
            this.layerOptions = ret;
        },

        addLayerFilter: async function () {
            this.layerOptions = this.layerOptions.filter(layer => layer.id !== this.selectedLayer.id);
            this.layerFilterModels.push(await this.createLayerFilterModel(this.selectedLayer));
            this.selectedLayer = null;
            this.updateAvailableLayerOptions();
        },

        getFieldValues: function (properties, prefix) {
            const ret = [];

            for (const entry of properties) {
                for (const prop in entry) {
                    if (prop.startsWith(prefix)) {
                        ret.push(prop);
                    }
                }
            }

            return ret.length > 0 ? [... new Set(ret)].sort().reverse() : [prefix + "alle"];
        },

        countFacilitiesPerFeature (facilityFeatures, features, property = undefined) {
            const fmap = Object.fromEntries(features.map(feat => [feat.getId(), 0]));

            for (const ffeature of facilityFeatures) {
                for (const feature of features) {
                    let polygon,
                        val;

                    try {
                        // expect multipolygon, try polygon if exception
                        polygon = turf.multiPolygon(feature.getGeometry().getCoordinates());
                        // polygon.geometry.coordinates = polygon.geometry.coordinates.map(lr => lr.map(p => [p[0], p[1]]));
                    }
                    catch (e) {
                        polygon = turf.polygon(feature.getGeometry().getCoordinates());
                        // polygon.geometry.coordinates = polygon.geometry.coordinates.map(poly => poly.map(lr => lr.map(p => [p[0], p[1]])));
                    }
                    if (
                        polygon &&
                        turf.booleanPointInPolygon(turf.point(this.getCoordinate(ffeature)), polygon)
                    ) {
                        val = property ? parseFloat(ffeature.get(property)) : 1;
                        val = !isNaN(val) ? val : 1;

                        fmap[feature.getId()] = fmap[feature.getId()] + val;

                        break;
                    }
                }
            }

            return fmap;
        },

        loadFeatures: async function (layer) {
            if (this.propertiesMap[layer.id] && layer.property === undefined) {
                return;
            }
            const features = await this.getAllFeatures(layer.id);

            if (layer.facilityLayerName) {
                const adminFeatures = this.cloneDistrictFeatures(this.selectedDistrictLevel.districts),
                    fmap = this.countFacilitiesPerFeature(features, adminFeatures, layer.property);

                this.propertiesMap[layer.id] = adminFeatures.map(feature => {
                    /**
                     * @todo Dirty, since facilities might have timelines in the future themselves! Overhaul in "countFacilitiesPerFeature" method
                     */
                    const ret = feature.getProperties();

                    for (let i = 2012; i < new Date().getFullYear(); i++) {
                        ret["jahr_" + i] = fmap[feature.getId()];
                    }

                    return {
                        ...ret,
                        feature,
                        id: ret[this.keyOfAttrNameStats],
                        [this.selectorField]: this.keyOfAttrNameStats,
                        isFacility: true
                    };
                });
            }
            else {
                this.propertiesMap[layer.id] = features.map(feature => {
                    const ret = feature.getProperties();

                    ret.feature = feature;
                    ret.id = ret[this.keyOfAttrNameStats];
                    return ret;
                });
            }
        },

        cloneDistrictFeatures (districts) {
            return districts.map(district => {
                const feature = district.adminFeature.clone();

                feature.setId(feature.get(this.keyOfAttrName));
                feature.set(this.keyOfAttrNameStats, feature.getId());

                return feature;
            });
        },

        createLayerFilterModel: async function (layer) {
            await this.loadFeatures(layer);

            const valueType = layer.valueType,
                features = this.propertiesMap[layer.id],
                fieldValues = this.getFieldValues(features, "jahr_"),
                field = fieldValues[0],
                model = {layerId: layer.id, currentLayerId: layer.id, name: layer.name, field, valueType, high: 0, low: 0, fieldValues, facilityLayerName: layer.facilityLayerName,
                    ...this.getMinMaxForField(layer.id, field),
                    quotientLayers: this.allLayerOptions.filter(l=>l.id !== layer.id).map(l=>({id: l.id, name: l.name})),
                    properties: await this.getFacilityProperties(layer)
                };

            this.setLayerFilterModelValue(model);
            return model;
        },

        setLayerFilterModelValue (model) {
            const features = this.propertiesMap[model.currentLayerId];

            if (this.selectedDistrict) {
                const selector = this.keyOfAttrNameStats,
                    feature = features.find(f => f[selector] === this.selectedDistrict);

                if (feature) {
                    const value = Number(Number(parseFloat(feature[model.field])).toFixed(3));

                    if (!isFinite(value)) {
                        model.error = this.$t("additional:modules.tools.cosi.queryDistricts.selectedDistrictNotAvailable");
                        model.value = NaN;
                    }
                    else {
                        model.value = value;
                        model.error = undefined;
                    }
                }
            }
            else {
                model.value = 0;
                model.error = undefined;
            }
        },

        getMinMaxForField (layerId, field) {
            const invalidFeatures = [],
                features = this.propertiesMap[layerId],
                values = features.reduce((res, f) => {
                    const v = parseFloat(f[field]);

                    if (isNaN(v)) {
                        invalidFeatures.push(f[this.keyOfAttrName]);
                        return res;
                    }
                    return [...res, v];
                }, []),
                max = Math.max(...values),
                min = Math.min(...values);

            return {min, max, invalidFeatures};
        },

        async computeResults () {
            if (this.layerFilterModels.length) {
                const result = await this.setComparableFeatures(this.layerFilterModels);

                this.resultNames = result.resultNames;
                this.results = result.table;
                this.resultTableHeaders = [{text: "Name", align: "start", value: "name"}];
                for (let i = 0; i < this.layerFilterModels.length; i++) {
                    this.resultTableHeaders.push({text: this.layerFilterModels[i].name, value: i.toString(), align: "center"});
                }
                this.showDistrictFeatures(result.features);
            }
            else {
                this.resultNames = null;
                this.results = null;
                this.showSelectedDistrict();
            }
        },

        zoomToDistrict: function (row) {
            const selectedDistrictLayer = this.layer,
                attributeSelector = this.keyOfAttrName,
                districtFeatures = selectedDistrictLayer.getSource().getFeatures();


            for (const feature of districtFeatures) {
                if (feature.getProperties()[attributeSelector] === row.name) {
                    const extent = feature.getGeometry().getExtent();

                    this.zoomTo(extent, {padding: [20, 20, 20, 20]});
                    return;
                }
            }
        },

        changeDistrictSelection: function () {
            const refDistrictName = this.refDistrict?.get(this.keyOfAttrName);

            this.setDistrictsByName({
                districtNames: refDistrictName ? [...this.resultNames, refDistrictName] : this.resultNames
            });
        },

        /**
         * @deprecated
         * @returns {void}
         */
        showInDashboard: function () {
            const Ctor = Vue.extend(DashboardResult),
                root = document.createElement("div"),
                cont = document.createElement("div"), // nested container needed for mount
                i18n = this.$t("additional:modules.tools.cosi.queryDistricts", {"returnObjects": true});

            root.appendChild(cont);

            /**
             * @deprecated
             * @todo replace with new storage
             */
            // Radio.trigger("Dashboard", "destroyWidgetById", "compareDistricts");
            // Radio.trigger("Dashboard", "append", $(root), "#dashboard-containers", {
            //     id: "compareDistricts",
            //     name: "Vergleichbare Gebiete ermitteln",
            //     glyphicon: "glyphicon glyphicon-random",
            //     scalable: true
            // });

            if (this.dashboard !== null) {
                this.dashboard.$destroy();
                this.dashboard = null;
            }

            this.dashboard = new Ctor({
                propsData: {resultTableHeaders: this.resultTableHeaders, results: this.results, i18n}
            }).$mount(cont);
        },

        async updateFilter (value) {
            const filters = [...this.layerFilterModels];

            for (let i = 0; i < filters.length; i++) {
                if (filters[i].layerId === value.layerId) {
                    filters[i] = {...filters[i], ...value};

                    if (value.field || value.quotientLayer === null || value.quotientLayer || value.property || value.property === null) {
                        let currentLayerId = filters[i].layerId;

                        if (value.property !== undefined) {
                            await this.loadFeatures({id: value.layerId, property: value.property, facilityLayerName: filters[i].facilityLayerName});
                        }
                        if (value.quotientLayer) {
                            await this.computeQuotientLayer(value);
                            currentLayerId = `${filters[i].layerId}/${filters[i].quotientLayer}`;
                        }

                        filters[i] = {
                            ...filters[i],
                            currentLayerId,
                            ...this.getMinMaxForField(currentLayerId, filters[i].field)
                        };

                        this.setLayerFilterModelValue(filters[i]);
                    }
                    break;
                }
            }
            this.layerFilterModels = filters;
        },

        async computeQuotientLayer (value) {
            await this.loadFeatures({
                id: value.quotientLayer,
                facilityLayerName: this.facilityNames.find(item => item.id === value.quotientLayer)?.name
            });

            const lprops = this.propertiesMap[value.layerId],
                qprops = this.propertiesMap[value.quotientLayer],
                qid = `${value.layerId}/${value.quotientLayer}`;

            this.propertiesMap[qid] = lprops.map(entry => {

                const props = qprops.find(p=>p.id === entry.id),
                    ret = {...props};

                for (const p in props) {
                    if (p.startsWith("jahr_")) {
                        ret[p] = entry[p] / props[p];
                    }
                }
                ret.feature = entry.feature;
                return ret;
            });
        },

        closeFilter (value) {
            this.layerFilterModels = this.layerFilterModels.filter(elem => elem.layerId !== value.layerId);
            this.updateAvailableLayerOptions();
        },

        showHelp: function () {
            this.cleanup();
            this.addSingleAlert({
                category: "Info",
                content: Info,
                displayClass: "info"
            });
        },

        close () {
            this.setActive(false);

            // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {
                id: this.$store.state.Tools.QueryDistricts.id
            });

            if (model) {
                model.set("isActive", false);
            }
        },

        createDistrictStyle () {
            return new Style({
                fill: new Fill({
                    color: [8, 119, 95, 0.3]
                }),
                stroke: new Stroke({
                    color: [8, 119, 95, 0.3],
                    width: 3
                })
            });
        },

        showSelectedDistrict: function () {
            this.mapLayer.getSource().clear();

            if (this.selectedDistrict) {

                this.refDistrict = this.layer.getSource().getFeatures()
                    .find(feature => feature.getProperties()[this.keyOfAttrName] === this.selectedDistrict);

                const featureClone = this.refDistrict.clone();

                featureClone.setStyle(this.createDistrictStyle());

                this.mapLayer.getSource().addFeature(featureClone);
            }
        },

        showDistrictFeatures (districtFeatures) {
            this.mapLayer.getSource().clear();

            const cloneCollection = districtFeatures.map((feature) => {
                const featureClone = feature.clone();

                featureClone.setStyle(this.createDistrictStyle());
                return featureClone;
            });

            if (this.refDistrict) {
                const refDistrictClone = this.refDistrict.clone();

                refDistrictClone.setStyle(this.createDistrictStyle());
                cloneCollection.push(refDistrictClone);
            }
            this.mapLayer.getSource().addFeatures(cloneCollection);
        },

        setFacilityNames (models) {
            this.facilityNames = models.filter(
                (model) => model.get("isFacility") === true
            ).map((model) => ({
                name: model.get("name").trim(),
                id: model.get("id")
            }));
        },

        async getFacilityFeatures (name) {
            const selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", {
                name: name
            });

            return selectedLayerModel ? this.getAllFeatures(selectedLayerModel.id) : [];
        },

        async getFacilityProperties (layer) {
            if (layer.facilityLayerName) {
                const layerMap = this.layerMapById(layer.id);

                return layerMap?.numericalValues || null;
            }
            return null;
        },

        getCoordinate: function (feature) {
            const geometry = feature.getGeometry();

            if (geometry) {
                if (geometry.getType() === "Point") {
                    return geometry.getCoordinates().splice(0, 2);
                }

                return Extent.getCenter(geometry?.getExtent());
            }

            return [0, 0];
        },

        exportTable: function () {
            const exportData = this.results.map(r=>renameKeys(
                    Object.assign({}, ...this.resultTableHeaders.map(h=>({[h.value]: h.text}))), r)),
                date = new Date().toLocaleDateString("de-DE", {year: "numeric", month: "numeric", day: "numeric"}),
                filename = `${this.$t("additional:modules.tools.cosi.featuresList.exportFilename")}_${date}`;

            exportXlsx(exportData, filename, {exclude: this.excludedPropsForExport});
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t('additional:modules.tools.cosi.queryDistricts.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <v-app>
                <div
                    v-if="active"
                    id="queryDistricts"
                    class="compare-districts"
                >
                    <div class="selectors">
                        <v-autocomplete
                            id="layerfilter-selector-container"
                            v-model="selectedLayer"
                            :label="$t('additional:modules.tools.cosi.queryDistricts.layerDropdownLabel')"
                            item-text="name"
                            item-value="id"
                            :items="layerOptions"
                            :clearable="false"
                            outlined
                            dense
                            return-object
                            class="qd-select"
                        />
                        <v-autocomplete
                            id="district-selector-container"
                            v-model="selectedDistrict"
                            :label="$t('additional:modules.tools.cosi.queryDistricts.districtDropdownLabel')"
                            :items="districtNames"
                            :clearable="true"
                            outlined
                            dense
                            class="qd-select"
                        />
                        <div
                            id="help"
                            @click="showHelp()"
                        >
                            <span class="glyphicon glyphicon-question-sign" />
                        </div>
                    </div>
                    <br>
                    <div>
                        <button
                            id="add-filter"
                            type="button"
                            class="btn btn-lgv-grey measure-delete"
                            :disabled="selectedLayer===null"
                            @click="addLayerFilter()"
                        >
                            <span class="glyphicon glyphicon-plus" />
                            {{ $t('additional:modules.tools.cosi.queryDistricts.add') }}
                        </button>
                    </div>
                    <br>
                    <div id="layerfilter-container" />
                    <div id="results">
                        <template
                            v-for="filter in layerFilterModels"
                        >
                            <LayerFilter
                                id="layer-filter"
                                :key="filter.layerId"
                                :locale="currentLocale"
                                v-bind="filter"
                                class="layer-filter"
                                @update="updateFilter"
                                @close="closeFilter"
                            />
                        </template>
                        <div id="params" />
                        <div
                            v-if="selectedDistrict"
                            id="reference-district"
                        >
                            <strong>
                                {{ $t('additional:modules.tools.cosi.queryDistricts.referenceDistrict') }}:
                            </strong>
                            <span
                                id="reference-district-button"
                                class="name-tag district-name"
                                @click="zoomToDistrict({'name': selectedDistrict})"
                            >{{ selectedDistrict }}</span>
                        </div>
                        <div
                            v-if="resultNames"
                            id="compare-results"
                        >
                            <p>
                                <strong>
                                    {{ $t('additional:modules.tools.cosi.queryDistricts.comparableResults') }}:
                                </strong>
                            </p>
                            <v-data-table
                                v-if="resultNames.length > 0"
                                id="result-table"
                                dense
                                :headers="resultTableHeaders"
                                :items="results"
                                item-key="name"
                                class="elevation-1"
                                :footer-props="{
                                    'items-per-page-text': $t('additional:modules.tools.cosi.queryDistricts.rowsPerPage')
                                }"
                                @click:row="zoomToDistrict"
                            >
                                <template
                                    v-for="col in resultTableHeaders.filter(e => e.value !== 'name')"
                                    #[`item.${col.value}`]="{ item, header }"
                                >
                                    {{ parseFloat(item[header.value]).toLocaleString(currentLocale) }}
                                </template>
                            </v-data-table>
                        </div>
                    </div>
                    <br>
                    <div>
                        <button
                            v-if="resultNames && resultNames.length"
                            id="set-selected-district"
                            class="btn btn-lgv-grey measure-delete"
                            @click="changeDistrictSelection()"
                        >
                            {{ $t('additional:modules.tools.cosi.queryDistricts.resultAsSelection') }}
                        </button>
                    </div>
                    <br>
                    <div>
                        <!-- <button
                            v-if="resultNames && resultNames.length"
                            id="show-in-dashboard"
                            class="btn btn-lgv-grey measure-delete"
                            @click="showInDashboard()"
                        >
                            {{ $t('additional:modules.tools.cosi.queryDistricts.showInDashboardLable') }}
                        </button> -->
                        <v-btn
                            v-if="resultNames && resultNames.length"
                            tile
                            depressed
                            :title="$t('additional:modules.tools.cosi.queryDistricts.exportTable')"
                            @click="exportTable()"
                        >
                            {{ $t('additional:modules.tools.cosi.queryDistricts.exportTable') }}
                        </v-btn>
                    </div>
                </div>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less">
.selectors {
    display: flex;
    flex-direction: column;
}

.qd-select .v-select__selection {
  white-space: nowrap;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 496px;
}

.qd-select .v-select__selections {
  max-width: 496px;
  max-height: 30px;
}

#help {
    align-self: flex-end;
}
.layer-filter {
    margin-bottom: 10px;
}

#compare-results {
    max-width: 500px;
 word-wrap: break-word
}

.compare-districts {
    #layerfilter-selector-container {
        .bootstrap-select {
            width: 12vw !important;
        }

        .dropdown-menu.open {
            width: 400px;
            height: 200px;
        }
    }

    #district-selector-container {
        .bootstrap-select {
            width: 12vw !important;
        }

        .dropdown-menu.open {
            height: 200px;
        }
    }
}


#add-filter {
    width: 100%;
}


#help {
    padding-top: 5px;
    background-color: white;
    height: 30px;
    border: 1px solid #ccc;
    cursor: pointer;
    text-align: center;
    min-width: 30px;
}

#help:hover {
    background-color: #d3d3d3;
}

#compare-results {
    line-height: 1.6;
}

.name-tag {
    border-radius: 5px;
    background-color: #E3E3E3;
    color: black;
    padding: 2px 4px;
    margin: 2px;
    display: inline-block;
}

.name-tag.district-name {
    cursor: pointer;
}

.compare-districts {
    min-height: 300px;
}

#show-in-dashboard,
#set-selected-district {
    width: 100%;
}

.table {

    th,
    td {
        border-bottom: 1px solid #ddd;
    }

    tr:hover {
        background-color: #f5f5f5;
    }
}
#reference-district {
    color: #646262;
    margin-bottom: 10px;
}
.download-container {
    float: left;
    padding-top: 25px;
     @media (max-width: 600px) {
          padding-top: 35px;
     }
}
</style>