<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import Multiselect from "vue-multiselect";

export default {
    name: "SchoolRoutePlanningSchools",
    components: {
        Multiselect
    },
    props: {
        layer: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Tools/SchoolRoutePlanning", [
            "regionalPrimarySchoolName",
            "regionalPrimarySchoolNumber",
            "selectedSchoolNumber",
            "sortedSchools"
        ]),

        /**
         * Getter for sorted school attributes.
         * @returns {Object[]} The schools contains id and name with address.
         */
        sortedSchoolAttributes () {
            const sortedSchoolAttributes = this.sortedSchools.map(school => {
                return {
                    id: school.get("schul_id"),
                    name: `${school.get("schulname")}, ${school.get("adresse_strasse_hausnr")}`
                };
            });

            return sortedSchoolAttributes;
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
        },

        /**
         * Watcher for selectedSchoolNumber
         * @param {Object} schoolNumber The number of the school.
         * @returns {void}
         */
        selectedSchoolNumber (schoolNumber) {
            this.selectSchool({
                selectedSchoolId: schoolNumber.id,
                layer: this.layer
            });
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
        ...mapMutations("Tools/SchoolRoutePlanning", ["setSelectedSchoolNumber"]),
        ...mapActions("Tools/SchoolRoutePlanning", ["selectSchool"]),

        /**
         * Sets the school number to dropdown.
         * @param {String} schoolNumber The number of the selected school.
         * @param {String} schoolName The name of the selected school.
         * @returns {void}
         */
        selectSchoolNumber (schoolNumber, schoolName) {
            this.setSelectedSchoolNumber({
                id: schoolNumber,
                name: schoolName
            });
        }
    }

};
</script>

<template>
    <div class="mb-3">
        <div class="tool-schoolRoutePlanning-schools-regionalPrimarySchool">
            <span
                v-if="regionalPrimarySchoolName"
                :title="$t('additional:modules.tools.schoolRoutePlanning.selectSchool')"
            >
                {{ $t("additional:modules.tools.schoolRoutePlanning.regionalPrimarySchool") }}
                <a
                    role="button"
                    tabindex="0"
                    href="#"
                    @click="selectSchoolNumber(regionalPrimarySchoolNumber, regionalPrimarySchoolName)"
                    @keydown.enter="selectSchoolNumber(regionalPrimarySchoolNumber, regionalPrimarySchoolName)"
                >
                    {{ $t(regionalPrimarySchoolName) }}
                </a>
            </span>
        </div>
        <div class="tool-schoolRoutePlanning-schools-multiselect-container">
            <label
                for="tool-schoolRoutePlanning-schools-select"
                class="form-label"
            >
                {{ $t("additional:modules.tools.schoolRoutePlanning.selectSchool") }}
            </label>
            <Multiselect
                id="tool-schoolRoutePlanning-schools-multiselect"
                :value="selectedSchoolNumber"
                track-by="name"
                label="name"
                :show-labels="false"
                :options="sortedSchoolAttributes"
                :placeholder="$t('additional:modules.tools.schoolRoutePlanning.selectSchool')"
                :allow-empty="false"
                @input="setSelectedSchoolNumber"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .tool-schoolRoutePlanning-schools-regionalPrimarySchool {
        margin-bottom: 1rem;
    }
</style>

<style lang="scss">
    @import "~/css/mixins.scss";
    @import "~variables";

    .tool-schoolRoutePlanning-schools-multiselect-container .multiselect, .filter-select-box-container .multiselect__input, .tool-schoolRoutePlanning-schools-multiselect-container .multiselect__single {
        font-family: inherit;
        font-size: $font-size-base;
        color: $black;
    }

    .tool-schoolRoutePlanning-schools-multiselect-container .multiselect .multiselect__option {
        display: block;
        min-height: 16px;
        line-height: 8px;
        text-decoration: none;
        text-transform: none;
        position: relative;
        white-space: nowrap;
        padding: 10px 12px;
    }

    .tool-schoolRoutePlanning-schools-multiselect-container .multiselect .multiselect__option--selected {
        background: inherit;
        color: inherit;
        font-weight: inherit;
    }

    .tool-schoolRoutePlanning-schools-multiselect-container .multiselect .multiselect__option--highlight {
        background: $light_blue;
        outline: none;
        color: $white;
        font-weight: inherit;
    }

    .tool-schoolRoutePlanning-schools-multiselect-container .multiselect .multiselect__input {
        color: $light_grey;
        font-family: inherit;
        font-size: $font-size-big;
    }
</style>
