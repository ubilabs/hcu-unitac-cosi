<script>
import BildungsatlasTest from "./BildungsatlasTest.vue";
import {BildungsatlasApi} from "../utils/bildungsatlasApi.js";

export default {
    name: "Bildungsatlas",
    components: {
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
    created () {
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
            console.error("for Bildungsatlas, the config must include a gfiTheme.params.featureType (" + this.feature.getTitle() + ")");
            this.featureType = "";
        }

        this.properties = typeof properties === "object" && properties !== null ? properties : {};

        this.api = new BildungsatlasApi(this.configApiUrl);
    },
    methods: {
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
        <ul class="nav nav-pills">
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
            <BildungsatlasTest
                v-if="subTheme === 'BildungsatlasTest'"
                :isActiveTab="isActiveTab"
                :featureType="featureType"
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
