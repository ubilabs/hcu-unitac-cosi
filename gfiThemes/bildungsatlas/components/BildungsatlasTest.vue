<script>
import {optimizeComplexTypeValues, convertComplexTypeToPiechart, convertComplexTypeToBarchart, convertComplexTypeToLinechart, convertComplexTypesToMultilinechart, sortComplexType} from "../../../utils/complexType.js";
import Piechart from "../../../../src/share-components/charts/components/Piechart.vue";
import Barchart from "../../../../src/share-components/charts/components/Barchart.vue";
import Linechart from "../../../../src/share-components/charts/components/Linechart.vue";

export default {
    name: "BildungsatlasTest",
    components: {
        Piechart,
        Barchart,
        Linechart
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
         * the properties as a key value object
         */
        properties: {
            type: Object,
            required: true
        },
        /**
         * the BildungsatlasApi to access data via wfs with
         */
        api: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            bezirk_name: "",
            bezirk_value: "",
            stadtteil_name: "",
            stadtteil_value: "",
            piechartData: false,
            barchartData: false,
            linechartData: false,
            multiLinechartData: false,
            multiLinechartData2: false,
            anzahl_sus_primarstufe_stadt: false
        };
    },
    mounted () {
        this.bezirk_name = this.properties?.bezirk_name ? this.properties.bezirk_name : "";
        this.stadtteil_name = this.properties?.stadtteil_name ? this.properties.stadtteil_name : "";
        this.piechartData = convertComplexTypeToPiechart(sortComplexType(optimizeComplexTypeValues(this.properties?.anzahl_sus_primarstufe, 2)));
        this.barchartData = convertComplexTypeToBarchart(sortComplexType(optimizeComplexTypeValues(this.properties?.anzahl_sus_primarstufe, 2)));
        this.linechartData = convertComplexTypeToLinechart(sortComplexType(optimizeComplexTypeValues(this.properties?.anzahl_sus_primarstufe, 2)));
        this.multiLinechartData = convertComplexTypesToMultilinechart([
            sortComplexType(optimizeComplexTypeValues(this.properties?.anzahl_sus_primarstufe, 2)),
            sortComplexType(optimizeComplexTypeValues(this.properties?.anzahl_sus_sekundarstufe, 2))
        ]);
        this.multiLinechartData2 = convertComplexTypesToMultilinechart([
            sortComplexType(optimizeComplexTypeValues(this.properties?.anteil_sus_stadtteilschulen, 2)),
            sortComplexType(optimizeComplexTypeValues(this.properties?.anteil_sus_gymnasien, 2)),
            sortComplexType(optimizeComplexTypeValues(this.properties?.anteil_sus_sonderschulen, 2))
        ]);

        // api test values
        this.api.getValueBezirk("anzahl_sus_primarstufe", this.properties?.bezirk_id, value => {
            this.bezirk_value = value;
        }, error => {
            console.error(error);
        });
        this.api.getValueStadtteil("anzahl_sus_primarstufe", this.properties?.stadtteil_id, value => {
            this.stadtteil_value = value;
        }, error => {
            console.error(error);
        });

        // api test complexType
        this.api.getComplexTypeStadt("anzahl_sus_primarstufe", complexType => {
            this.anzahl_sus_primarstufe_stadt = convertComplexTypeToBarchart(sortComplexType(optimizeComplexTypeValues(complexType)));
        }, error => {
            console.error(error);
        });
    }
};
</script>

<template>
    <div class="gfi-test">
        <div
            class="tab-panel gfi-data"
            :class="{ 'hidden': !isActiveTab('data') }"
        >
            <p>
                Bezirk: {{ bezirk_name }}
            </p>
            <p>
                Grundschüler im Bezirk (API-Test): {{ bezirk_value }}
            </p>
            <hr>
            <p>
                Stadtteil: {{ stadtteil_name }}
            </p>
            <p>
                Grundschüler im Stadtteil (API-Test): {{ stadtteil_value }}
            </p>
            <hr>
            <p class="diagram_title">
                Beispiel Balkendiagramm (API-Test): Anzahl der Schülerinnen und Schüler an Grundschulen in Hamburg
            </p>
            <Barchart
                v-if="anzahl_sus_primarstufe_stadt"
                :given-options="{}"
                :data="anzahl_sus_primarstufe_stadt"
            />
            <hr>
            <p class="diagram_title">
                Beispiel Kuchendiagramm: Anzahl der Schülerinnen und Schüler an Grundschulen
            </p>
            <Piechart
                v-if="piechartData"
                diagram-type="pie"
                :given-options="{}"
                :data="piechartData"
            />
            <hr>
            <p class="diagram_title">
                Beispiel Doughnut-Diagram: Anzahl der Schülerinnen und Schüler an Grundschulen
            </p>
            <Piechart
                v-if="piechartData"
                diagram-type="doughnut"
                :given-options="{}"
                :data="piechartData"
            />
            <hr>
            <p class="diagram_title">
                Beispiel Balkendiagramm: Anzahl der Schülerinnen und Schüler an Grundschulen
            </p>
            <Barchart
                v-if="barchartData"
                :given-options="{}"
                :data="barchartData"
            />
            <hr>
            <p class="diagram_title">
                Beispiel Liniendiagramm: Anzahl der Schülerinnen und Schüler an Grundschulen
            </p>
            <Linechart
                v-if="linechartData"
                :given-options="{}"
                :data="linechartData"
            />
            <hr>
            <p class="diagram_title">
                Beispiel Multi-Liniendiagramm: Anzahl der Schülerinnen und Schüler an Primar- und Sekundarstufen
            </p>
            <Linechart
                v-if="multiLinechartData"
                :given-options="{}"
                :data="multiLinechartData"
            />
            <hr>
            <p class="diagram_title">
                Beispiel Multi-Liniendiagramm: Verschiedene Anteile
            </p>
            <Linechart
                v-if="multiLinechartData2"
                :given-options="{}"
                :data="multiLinechartData2"
            />
            <hr>
            <p class="diagram_title">
                Beispiel Footer:
            </p>
            <p>
                {{ $t("additional:addons.gfiThemes.bildungsatlas.general.disclaimer") }}
            </p>
            <p>
                {{ $t("additional:addons.gfiThemes.bildungsatlas.general.hint") }}
            </p>
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

    .diagram_title {
        margin-top: 50px;
    }
    .hidden {
        display: none;
    }
    .footer {
        margin: 0 0 10px 10px;
    }
}
</style>
