<script>
import {mapGetters} from "vuex";

export default {
    name: "StatisticsTable",
    props: {
        value: {
            required: true,
            type: Array
        }
    },
    data: () => ({
        snack: false,
        snackColor: "",
        snackText: "",
        isNumber: v => !isNaN(parseFloat(v)) || this.$t("additional:modules.tools.cosi.residentialSimulation.isNotNumber"),
    }),
    computed: {
        ...mapGetters("Tools/DistrictLoader", ["mapping"]),
        headers () {
            return [
                {text: this.$t("additional:modules.tools.cosi.residentialSimulation.statsCategory"), value: "category"},
                {text: this.$t("additional:modules.tools.cosi.residentialSimulation.statsValue"), value: "value"}
            ];
        }
    },
    watch: {
        value: {
            deep: true,
            handler (e) {
                this.$emit("input", e);
            }
        }
    },
    methods: {
        save (item) {
            console.log(item)
            this.snack = true;
            this.snackColor = "success";
            this.snackText = this.$t("additional:modules.tools.cosi.success");
        },
        cancel () {
            this.snack = true;
            this.snackColor = "error";
            this.snackText = this.$t("additional:modules.tools.cosi.cancelled");
        },
        open () {
            this.snack = true;
            this.snackColor = "info";
            this.snackText = this.$t("additional:modules.tools.cosi.open");
        }
    }
};
</script>

<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="value"
            group-by="group"
            dense
            :items-per-page="-1"
        >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template v-slot:item.value="{ item }">
                <v-edit-dialog
                    :return-value.sync="item.value"
                    :rules="[isNumber]"
                    large
                    persistent
                    @save="save(item)"
                    @cancel="cancel"
                    @open="open"
                >
                    <div>{{ item.value }}</div>
                    <template v-slot:input>
                        <div class="mt-4 text-h6">
                            {{ $t("additional:modules.tools.cosi.residentialSimulation.editStats") }}
                        </div>
                        <v-text-field
                            v-model="item.value"
                            type="number"
                            :label="$t('additional:modules.tools.cosi.residentialSimulation.editStatsInfo')"
                            single-line
                            autofocus
                        ></v-text-field>s
                    </template>
                </v-edit-dialog>
            </template>
        </v-data-table>
        <v-snackbar
            v-model="snack"
            :timeout="3000"
            :color="snackColor"
        >
            {{ snackText }}

            <template v-slot:action="{ attrs }">
                <v-btn
                    v-bind="attrs"
                    text
                    @click="snack = false"
                >
                    {{ $t("additional:modules.tools.cosi.close") }}
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<style lang="less" scoped>
</style>
