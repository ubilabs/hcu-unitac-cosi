<script>
export default {
    name: "DataTable",
    components: {
    },
    props: {
        dataSet: {
            type: Array,
            default: () => []
        },
        typeA: {
            type: String,
            default: null
        },
        typeB: {
            type: String,
            default: null
        },
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
        headers () {
            const head = [
                {
                    text: "Gebiet",
                    value: "scope",
                    sortable: false,
                    show: true
                },
                {
                    text: this.typeA,
                    value: "paramA_val",
                    show: true
                },
                {
                    text: this.typeB,
                    value: "paramB_val",
                    show: true
                },
                {
                    text: this.typeA + " / " + this.typeB,
                    value: "relation",
                    show: true
                },
                {
                    text: "Kapazität",
                    value: "capacity",
                    show: this.fActive
                },
                {
                    text: "Bedarf",
                    value: "need",
                    show: this.fActive
                },
                {
                    text: "Bedarfsdeckung (1,0 ~ 100%)",
                    value: "coverage",
                    show: true
                }
            ];

            return head.filter(x=>x.show);
        },

        formatData () {
            return this.dataSet.map(scope => ({
                ...scope,
                paramA_val: scope.paramA_val.toLocaleString("de-DE"),
                paramB_val: scope.paramB_val.toLocaleString("de-DE"),
                relation: scope.relation.toLocaleString("de-DE"),
                coverage: scope.coverage.toLocaleString("de-DE"),
                capacity: scope.capacity.toLocaleString("de-DE"),
                need: scope.need.toLocaleString("de-DE")
            }));
        }
    }
};
</script>

<template lang="html">
    <div class="data_table">
        <v-data-table
            :headers="headers"
            :items="formatData"
            :items-per-page="10"
            class="elevation-1"
        >
            <template
                v-slot:item.paramA_val="{ item }"
            >
                <div class="table_cell">
                    {{ item.paramA_val }}
                    <span v-if="item.data">
                        <span v-if="item.data.incompleteDataSets_A > 0">*</span>
                        <div
                            v-if="item.data.incompleteDataSets_A > 0"
                            class="hover_helper"
                        >
                            {{ item.data.incompleteDataSets_A.toLocaleString("de-DE") }} / {{ item.data.dataSets_A }}
                        </div>
                    </span>
                </div>
            </template>
            <template
                v-slot:item.paramB_val="{ item }"
            >
                <div class="table_cell">
                    {{ item.paramB_val }}
                    <span v-if="item.data">
                        <span v-if="item.data.incompleteDataSets_B > 0">*</span>
                        <div
                            v-if="item.data.incompleteDataSets_B > 0"
                            class="hover_helper"
                        >
                            {{ item.data.incompleteDataSets_B.toLocaleString("de-DE") }} / {{ item.data.dataSets_B }}
                        </div>
                    </span>
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<style lang="less">
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
            opacity: 0;
            top: 50%;
            left: calc(100% - 25px);
            transform: translateY(-50%);
            width: 75px;
            text-align: center;
            padding: 5px 10px;
            height: 20px;
            background: #ccc;
            pointer-events: none;
            transition: 0.3s;
        }

        &:hover {
            .hover_helper {
                opacity:1;
            }
        }
    }
</style>


