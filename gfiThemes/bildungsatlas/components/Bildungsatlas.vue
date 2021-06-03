<script>
import {BildungsatlasApi} from "../utils/bildungsatlasApi.js";
import BildungsatlasOKJA from "./BildungsatlasOKJA.vue";
import BildungsatlasTest from "./BildungsatlasTest.vue";

export default {
    name: "Bildungsatlas",
    components: {
        BildungsatlasOKJA,
        BildungsatlasTest
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
            featureType: "",
            properties: {},
            api: null,
            configApiUrl: "config.api.json"
        };
    },
    computed: {
        subThemeComponent () {
            if (this.subTheme !== "") {
                return this.subTheme;
            }
            return "BildungsatlasTest";
        }
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

            this.properties = typeof properties === "object" && properties !== null ? properties : {};

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
        }
    }
};
</script>

<template>
    <div>
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
        <div class="tab-content">
            <component
                :is="subThemeComponent"
                :isActiveTab="isActiveTab"
                :properties="properties"
                :api="api"
            />
        </div>
    </div>
</template>

<style lang="less">
    .portal-title a img[alt*="Bildungsatlas"] {
        width: 80px;
    }
</style>
