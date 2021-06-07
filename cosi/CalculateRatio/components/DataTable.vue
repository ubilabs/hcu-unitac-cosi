<script>
export default {
    name: "DataTable",
    components: {
    },
    props: {
        // Dataset to be displayed in the table
        dataSet: {
            type: Array,
            default: null
        },
        // Type of field A (facility/feature)
        typeA: {
            type: String,
            default: null
        },
        // Type of field B (facility/feature)
        typeB: {
            type: String,
            default: null
        },
        // True if factor F was specified in CalculateRatio.vue
        fActive: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
        };
    },
    computed: {
        /**
         * @description Predefines the headers for the vuetify data-table.
         * @returns {void}
         */
        headers () {
            const head = [
                {
                    text: "Gebiet",
                    value: "scope",
                    sortable: false,
                    show: true,
                    help: "In dieser Spalte werden die Identifikatoren für die jeweiligen Datensätze aufgelistet. In den meisten Fällen handelt es sich dabei um die ausgewählten Gebiete."
                },
                {
                    text: this.typeA,
                    value: "paramA_val",
                    show: true,
                    help: "Dies ist das Ergebnis der Datenabfrage des ersten Feldes (1) (links)."
                },
                {
                    text: this.typeB,
                    value: "paramB_val",
                    show: true,
                    help: "Dies ist das Ergebnis der Datenabfrage des zweiten Feldes (2) (rechts)."
                },
                {
                    text: this.typeA + " / " + this.typeB,
                    value: "relation",
                    show: true,
                    help: "In diesem Feld werden die Werte des Feldes (1) und des Feldes (2) durcheinander geteilt. Das Ergebnis wird auf zwei Stellen hinter dem Komma gerundet."
                },
                {
                    text: "Kapazität",
                    value: "capacity",
                    show: this.fActive,
                    help: "Diese Tabellenspalte wird angezeigt, wenn für eines der beiden Auswahlfelder ein Faktor F bestimmt wurde. Es gibt an, für wieviele Einheiten der Referenzgruppe die Einrichtungen bereitgestellt werden können."
                },
                {
                    text: "Bedarf",
                    value: "need",
                    show: this.fActive,
                    help: "Diese Tabellenspalte wird angezeigt, wenn für eines der beiden Auswahlfelder ein Faktor F bestimmt wurde. Es gibt an, für wieviele Einrichtungen für die Gesamtzahl der Einheiten der Referenzgruppe benötigt werden würden."
                },
                {
                    text: "Bedarfsdeckung",
                    value: "coverage",
                    show: true,
                    help: "Dieses Feld gibt an, zu wieviel % der Bedarf gedeckt ist. Es wird durch den einstellbaren Faktor F und den einstellbaren Wert 'für X der Referenzgruppe berechnen' beeinflusst."
                }
            ];

            return head.filter(x=>x.show);
        }
    },
    watch: {
        dataSet () {
            this.formatData();
        }
    },
    mounted () {
        this.formatData();
    },
    methods: {
        /**
         * @description Formats the data to displayable numbers (two digits after the decimal point).
         * @returns {void}
         */
        formatData () {
            let index = 0;
            this.dataSet.forEach(scope => {
                scope.index = index;
                scope.paramA_val = scope.paramA_val.toLocaleString("de-DE");
                scope.paramB_val = scope.paramB_val.toLocaleString("de-DE");
                scope.relation = scope.relation.toLocaleString("de-DE");
                scope.coverage = (scope.coverage * 100).toLocaleString("de-DE") + "%";
                scope.capacity = scope.capacity.toLocaleString("de-DE");
                scope.need = scope.need.toLocaleString("de-DE");

                index += 1;
            });
        }
    }
};
</script>

<template lang="html">
    <div class="data_table">
        <v-data-table
            :headers="headers"
            :items="dataSet"
            :items-per-page="10"
            class="elevation-1"
            hide-default-header
        >
            <template
                v-slot:header="{ props }"
            >
                <thead>
                    <tr>
                        <th v-for="header in props.headers">
                            <p><strong>{{header.text}}</strong></p>
                            <div class="col_info">
                                <p>{{header.help}}</p>
                            </div>
                        </th>
                    </tr>
                </thead>
            </template>
            <template
                v-slot:item.paramA_val="{ item }"
            >
                <div 
                    class="table_cell"
                    :class="{ lower: item.index >= dataSet.length/2 }"
                >
                    {{ item.paramA_val }}

                    <span v-if="item.data.incompleteDataSets_A > 0">*</span>
                    <div
                        v-if="item.data.incompleteDataSets_A > 0"
                        class="hover_helper"
                    >
                        <h2><strong>{{ item.data.incompleteDataSets_A.toLocaleString("de-DE") }} / {{ item.data.dataSets_A }}</strong> Datensätze unvollständig</h2>
                        <p>Mit einem * gekennzeichnete Datensätze enthalten Einrichtungen, für die das ausgewählte Parameter (wie bspw. bei Schulen "Schülerzahl") nicht hinterlegt ist. In diesem Fall wird für diesen Datensatz mit dem Medianwert der vorhandenen vollständigen Datensätze kalkuliert.</p>
                    </div>
                </div>
            </template>
            <template
                v-slot:item.paramB_val="{ item }"
            >
                <div class="table_cell">
                    {{ item.paramB_val }}

                    <span v-if="item.data.incompleteDataSets_B > 0">*</span>
                    <div
                        v-if="item.data.incompleteDataSets_B > 0"
                        class="hover_helper"
                    >
                        <h2><strong>{{ item.data.incompleteDataSets_B.toLocaleString("de-DE") }} / {{ item.data.dataSets_B }}</strong> Datensätze unvollständig</h2>
                        <p>Mit einem * gekennzeichnete Datensätze enthalten Einrichtungen, für die das ausgewählte Parameter (wie bspw. bei Schulen "Schülerzahl") nicht hinterlegt ist. In diesem Fall wird für diesen Datensatz mit dem Medianwert der vorhandenen vollständigen Datensätze kalkuliert.</p>
                    </div>
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<style lang="less">
    .data_table {
        overflow:visible;
    }

    th {
        position:relative;
        z-index:10;

        .col_info {
            position:absolute;
            opacity:0;
            pointer-events: none;
            top:0;
            left:0;
            width:auto;
            height:auto;
            padding:10px;
            box-sizing: border-box;
            background:white;
            border:1px solid #ccc;
            z-index:12;

            p {
                font-size:12px;
            }
        }

        &:hover {
            cursor:pointer;
            .col_info {
                opacity:1;
                pointer-events:all;
                transition:0.15s linear 0.3s;
            }
        }
    }
    td {
        text-align:center;
    }

    .table_cell {
        display: flex;
        align-items: center;
        justify-content: center;
        position:relative;
        width:100%;
        height:100%;

        span {
            color:black;
            font-weight:900;
        }

        .hover_helper {
            position: absolute;
            pointer-events:none;
            opacity: 0;
            top: 0;
            left: calc(100% - 30px);
            width: auto;
            min-width:360px;
            text-align: center;
            padding: 10px;
            box-sizing: border-box;
            height: auto;
            background: white;
            border:1px solid #ccc;
            pointer-events: none;
            transition: 0.3s;
            z-index:10;

            h2 {
                color:black;
                font-size:13px;
                font-weight:700;
                text-align:left;
                padding-bottom:5px;
                margin-bottom:5px;
                border-bottom:1px solid #ccc;
                text-transform: none;

                strong {
                    font-size:16px;
                    margin-right:10px;
                }
            }

            p {
                color:#888;
                font-size:12px;
                text-align:left;
            }
        }
        
        &.lower {
            .hover_helper {
                top:auto;
                bottom:0;
            }
        }

        &:hover {
            .hover_helper {
                opacity:1;
                pointer-events:all;
                transition:0.3s;
            }
        }
    }
</style>


