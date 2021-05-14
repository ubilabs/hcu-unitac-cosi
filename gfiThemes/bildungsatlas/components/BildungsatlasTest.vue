<script>
import {convertComplexTypeToPiechart, sortComplexType} from "../../../utils/complexType.js";
import Piechart from "../../../../src/share-components/charts/components/Piechart.vue";

export default {
    name: "BildungsatlasTest",
    components: {
        Piechart
    },
    props: {
        /**
         * checks if the given tab name is currently active
         * @param {String} tab the tab name
         * @returns {Boolean}  true if the given tab name is active
         */
        isActiveTab: {
            type: Function,
            required: true
        },
        /**
         * the featureType to work with
         */
        featureType: {
            type: String,
            required: true
        },
        /**
         * the properties as a key value object
         */
        properties: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            bezirk_name: "",
            stadtteil_name: "",
            piechartData: false
        };
    },
    mounted () {
        this.bezirk_name = this.properties?.bezirk_name ? this.properties.bezirk_name : "";
        this.stadtteil_name = this.properties?.stadtteil_name ? this.properties.stadtteil_name : "";
        this.piechartData = convertComplexTypeToPiechart(sortComplexType(this.properties?.anzahl_sus_primarstufe));
    }
};
</script>

<template>
    <div class="gfi-test">
        <div
            class="tab-panel gfi-data"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <p>{{ bezirk_name }}</p>
            <p>{{ stadtteil_name }}</p>
            <Piechart
                v-if="piechartData"
                diagramType="doughnut"
                :givenOptions="{}"
                :data="piechartData"
            />
            <p>{{ $t("additional:addons.gfiThemes.bildungsatlas.general.disclaimer") }}</p>
            <p>{{ $t("additional:addons.gfiThemes.bildungsatlas.general.hint") }}</p>
        </div>
        <div
            class="tab-panel gfi-info"
            :class="{ 'hidden': !isActiveTab('info') }"
        >
            Info
        </div>
    </div>
</template>

<style lang="less" scoped>
.gfi-test {
    max-width: 420px;
    .panel {
        &.graphHeader {
            padding: 0 8px 8px;
            border-bottom: 2px solid #ddd;
        }
    }
    .gfi-data {
        padding: 10px;
    }
    .gfi-info {
        padding: 0 10px 10px;
    }

    .hidden {
        display: none;
    }
    .footer {
        margin: 0 0 10px 10px;
    }
}
</style>
