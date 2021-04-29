<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersSchoolRoutePlanning";
import mutations from "../store/mutationsSchoolRoutePlanning";
import actions from "../store/actionsSchoolRoutePlanning";

import "bootstrap-select";

export default {
    name: "SchoolRoutePlanningSchools",
    props: {
        layer: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Tools/SchoolRoutePlanning", Object.keys(getters)),

        /**
         * Getter and setter for the selected school number.
         */
        selectedSchoolNumber: {
            /**
             * Gets the selected school number from the vuex state.
             * @returns {String} The selected school number.
             */
            get () {
                return this.$store.state.Tools.SchoolRoutePlanning.selectedSchoolNumber;
            },
            /**
             * Sets the selected school number to the vuex state.
             * @param {String} value The selected school number.
             * @returns {void}
             */
            set (value) {
                this.setSelectedSchoolNumber(value);
            }
        }
    },
    watch: {
        /**
         * Sets the active property of the state to the given value.
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (value) {
            if (value) {
                this.initializeSelectpicker();
            }
        }
    },
    created () {
        this.initializeSelectpicker();
    },
    updated () {
        this.$nextTick(() => $(".selectpicker").selectpicker("refresh"));
    },
    methods: {
        ...mapMutations("Tools/SchoolRoutePlanning", Object.keys(mutations)),
        ...mapActions("Tools/SchoolRoutePlanning", Object.keys(actions)),

        /**
         * Initialize the selectpicker.
         * @returns {void}
         */
        initializeSelectpicker () {
            this.$nextTick(() => $(".selectpicker").selectpicker({
                width: "100%",
                selectedTextFormat: "value",
                size: 6
            }));
        },

        /**
         * Sets the selected regional primary school to dropdown.
         * @returns {void}
         */
        selectRegionalPrimarySchoolNumber () {
            this.setSelectedSchoolNumber(this.regionalPrimarySchoolNumber);
            this.selectSchool({
                selectedSchoolId: this.regionalPrimarySchoolNumber,
                layer: this.layer
            });
        }
    }

};
</script>

<template>
    <div class="schools-container">
        <div class="form-group col-xs-12">
            <span>
                <span class="regionalPrimarySchool">
                    {{ $t("additional:modules.tools.schoolRoutePlanning.regionalPrimarySchool") }}
                </span>
                <a
                    id="regional-school"
                    @click="selectRegionalPrimarySchoolNumber"
                >
                    {{ $t(regionalPrimarySchoolName) }}
                </a>
            </span>
        </div>
        <div class="form-group col-xs-12">
            <select
                id="tool-schoolRoutePlanning-schools"
                v-model="selectedSchoolNumber"
                class="selectpicker"
                :title="$t('additional:modules.tools.schoolRoutePlanning.selectSchool')"
                data-live-search="true"
                @change="event => selectSchool({selectedSchoolId: event.target.value, layer})"
            >
                <option
                    v-for="school in sortedSchools"
                    :key="school.get('schul_id')"
                    :value="school.get('schul_id')"
                >
                    {{ `${school.get('schulname')}, ${school.get('adresse_strasse_hausnr')}` }}
                </option>
            </select>
        </div>
    </div>
</template>

<style lang="less" scoped>
    .schools-container {
        .form-group {
            margin-bottom: 25px;
            >label {
                float: left;
                width: 75%;
            }
        }

        #regional-school {
            cursor: pointer;
        }
    }
</style>
