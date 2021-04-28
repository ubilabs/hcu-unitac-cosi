<script>
import {mapGetters, mapActions} from "vuex";
import getters from "../store/gettersSchoolRoutePlanning";
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
         * Gets the sorted list of school and update the selectpicker.
         * @returns {Object[]} the sorted schools
         */
        getSchools () {
            this.$nextTick(() => $(".selectpicker").selectpicker("refresh"));

            return this.sortedSchools;
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
    methods: {
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
        }
    }

};
</script>

<template>
    <div class="schools-container">
        <div class="form-group col-xs-12">
            <span>
                <span class="regionalPrimarySchool">
                    {{ $t("additional:modules.tools.routingToSchool.regionalPrimarySchool") }}
                </span>
                <a
                    id="regional-school"
                >
                    {{ $t(regionalPrimarySchoolName) }}
                </a>
            </span>
        </div>
        <div class="form-group col-xs-12">
            <select
                id="tool-schoolRoutePlanning-schools"
                class="selectpicker"
                :title="$t('additional:modules.tools.schoolRoutePlanning.selectSchool')"
                data-live-search="true"
                @change="event => selectSchool({event, layer})"
            >
                <option
                    v-for="school in getSchools"
                    :id="school.get('schul_id')"
                    :key="`schools-'${school.get('schul_id')}`"
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
