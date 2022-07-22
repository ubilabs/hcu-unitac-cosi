<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersSchoolRoutePlanning";
import mutations from "../store/mutationsSchoolRoutePlanning";
import actions from "../store/actionsSchoolRoutePlanning";

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
         * Select a school, if this tool is already open.
         * @param {String} value The number of the school.
         * @returns {void}
         */
        initialSelectedSchoolNumber (value) {
            this.selectSchoolNumber(value);
        }
    },
    mounted () {
        if (this.initialSelectedSchoolNumber !== "") {
            this.$nextTick(() => {
                this.selectSchoolNumber(this.initialSelectedSchoolNumber);
            });
        }
    },
    methods: {
        ...mapMutations("Tools/SchoolRoutePlanning", Object.keys(mutations)),
        ...mapActions("Tools/SchoolRoutePlanning", Object.keys(actions)),

        /**
         * Sets the school number to dropdown.
         * @param {String} schoolNumber The number of the selected school.
         * @returns {void}
         */
        selectSchoolNumber (schoolNumber) {
            this.setSelectedSchoolNumber(schoolNumber);
            this.selectSchool({
                selectedSchoolId: schoolNumber,
                layer: this.layer
            });
        }
    }

};
</script>

<template>
    <div class="mb-3">
        <label
            for="tool-schoolRoutePlanning-schools-select"
            class="form-label"
        >
            {{ $t("additional:modules.tools.schoolRoutePlanning.selectSchool") }}
        </label>
        <span
            v-if="regionalPrimarySchoolName"
            class="d-block"
        >
            {{ $t("additional:modules.tools.schoolRoutePlanning.regionalPrimarySchool") }}
            <a
                role="button"
                tabindex="0"
                href="#"
                :class="regionalPrimarySchoolNumber ? 'd-block' : ''"
                @click="selectSchoolNumber(regionalPrimarySchoolNumber)"
                @keydown.enter="selectSchoolNumber(regionalPrimarySchoolNumber)"
            >
                {{ $t(regionalPrimarySchoolName) }}
            </a>
        </span>
        <select
            id="tool-schoolRoutePlanning-schools-select"
            v-model="selectedSchoolNumber"
            class="form-select"
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
</template>

<style lang="scss" scoped>
</style>
