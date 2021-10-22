<script>
import {BildungsatlasApi} from "../utils/bildungsatlasApi.js";
import BildungsatlasBalkendiagramm from "./BildungsatlasBalkendiagramm.vue";
import BildungsatlasBalkendiagrammWanderungen from "./BildungsatlasBalkendiagrammWanderungen.vue";
import BildungsatlasFluechtlinge from "./BildungsatlasFluechtlinge.vue";
import BildungsatlasOKJA from "./BildungsatlasOKJA.vue";
import BildungsatlasSchulentlassene from "./BildungsatlasSchulentlassene.vue";
import BildungsatlasSchulenWohnort from "./BildungsatlasSchulenWohnort.vue";
import BildungsatlasSchulenEinzugsgebiete from "./BildungsatlasSchulenEinzugsgebiete.vue";

export default {
    name: "Bildungsatlas",
    components: {
        BildungsatlasBalkendiagramm,
        BildungsatlasBalkendiagrammWanderungen,
        BildungsatlasFluechtlinge,
        BildungsatlasOKJA,
        BildungsatlasSchulentlassene,
        BildungsatlasSchulenWohnort,
        BildungsatlasSchulenEinzugsgebiete
    },
    props: {
        /**
         * the feature as an object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl}
         */
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            activeTab: "data",
            subTheme: "",
            chartOptions: false,
            featureType: "",
            properties: {},
            api: null,
            configApiUrl: "config.api.json"
        };
    },
    watch: {
        // When the gfi window switched with arrow, the connection will be refreshed
        feature: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    this.refreshGfi();
                }
            },
            immediate: true
        }
    },
    created () {
        this.refreshGfi();
    },
    methods: {
        /**
         * refreshes the gfi
         * @returns {void}
         */
        refreshGfi () {
            const gfiTheme = this.feature?.getTheme(),
                gfiParams = gfiTheme?.params,
                properties = this.feature?.getProperties();

            if (typeof gfiParams === "object" && gfiParams?.subTheme) {
                this.subTheme = gfiParams.subTheme;
            }
            else {
                console.error("for Bildungsatlas, the config must include a gfiTheme.params.subTheme (" + this.feature.getTitle() + ")");
                this.subTheme = "";
            }
            if (typeof gfiParams === "object" && gfiParams?.featureType) {
                this.featureType = gfiParams.featureType;
            }
            else {
                this.featureType = "";
            }
            if (typeof gfiParams === "object" && gfiParams?.chartOptions) {
                this.chartOptions = gfiParams.chartOptions;
            }
            else {
                this.chartOptions = false;
            }

            this.properties = typeof properties === "object" && properties !== null ? properties : {};

            if (this.subTheme === "") {
                this.configApiUrl = false;
            }
            // BildungsatlasApi is a singleton
            this.api = new BildungsatlasApi(this.configApiUrl);
        },
        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {boolean} true if the given tab name is active
         */
        isActiveTab (tab) {
            return this.activeTab === tab;
        },
        /**
         * sets the active tab by tab name
         * @param {String} tab the tab name
         * @returns {void}
         */
        setActiveTab (tab) {
            this.activeTab = tab;
        },
        /**
         * translates the given key, checkes if the key exists and throws a console warning if not
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself on error
         */
        translate (key, options = null) {
            if (key === "additional:" + this.$t(key)) {
                console.warn("the key " + JSON.stringify(key) + " is unknown to the additional translation");
            }
            return this.$t(key, options);
        },

        /**
         * Parsing the text with Html Tags into Html Format
         * @param {String} str the text
         * @returns {String} html format text
         */
        parseTranslationInHtml (str) {
            const parser = new DOMParser(),
                doc = parser.parseFromString(str, "text/html");

            return doc.body.innerHTML;
        }
    }
};
</script>

<template>
    <div class="gfi-bildungsatlas">
        <ul
            class="nav nav-pills"
        >
            <li :class="{ active: isActiveTab('data') }">
                <a
                    href="#data"
                    @click.prevent="setActiveTab('data')"
                >{{ $t("additional:addons.gfiThemes.bildungsatlas.general.tabData") }}</a>
            </li>
            <li :class="{ active: isActiveTab('info') }">
                <a
                    href="#info"
                    @click.prevent="setActiveTab('info')"
                >{{ $t("additional:addons.gfiThemes.bildungsatlas.general.tabInfo") }}</a>
            </li>
        </ul>
        <div
            v-if="subTheme !== ''"
            class="tab-content"
        >
            <component
                :is="subTheme"
                :is-active-tab="isActiveTab"
                :feature="feature"
                :properties="properties"
                :chart-options="chartOptions"
                :api="api"
                :feature-type="featureType"
                :translate="translate"
                :parse-translation-in-html="parseTranslationInHtml"
            />
            <div class="gfi-bildungsatlas-footer">
                <span>
                    {{ $t("additional:addons.gfiThemes.bildungsatlas.general.hint") }}
                </span>
            </div>
        </div>
    </div>
</template>

<style lang="less">
    .portal-title a img[alt*="Bildungsatlas"] {
        width: 80px;
    }
    .gfi-bildungsatlas {
        .gfi-info {
            padding: 0 10px 10px;
            h5 {
                font-weight: bold;
            }
            p {
                margin-bottom: 10px;
            }
        }
        .panel {
            &.graphHeader {
                padding: 0 8px 8px;
                border-bottom: 2px solid #ddd;
            }
        }
        .gfi-data {
            padding: 10px;
        }
        .rba_header {
            margin-top: 15px;
            .rba_header_title {
                font-weight: bold;
            }
        }
        .rba_table {
            margin-top: 15px;
            padding-top: 7px;
            border-top: 1px solid #ddd;
            table {
                width: 100%;
            }
            td {
                vertical-align: top;
            }
            td.rba_table_rightcol {
                text-align: right;
            }
        }
        .rba_chart {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            .rba_chart_title {
                font-weight: bold;
            }
        }
        .rba_footer {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }

        .hidden {
            display: none;
        }
        .footer {
            margin: 0 0 10px 10px;
        }
        .gfi-bildungsatlas-footer {
            padding: 10px;
            border-top: 1px solid #ddd;
        }
    }
</style>
