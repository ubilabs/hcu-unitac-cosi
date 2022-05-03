<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersSchoolRoutePlanning";
import actions from "../store/actionsSchoolRoutePlanning";
import mutations from "../store/mutationsSchoolRoutePlanning";
import Multiselect from "vue-multiselect";

export default {
    name: "SchoolRoutePlanningAddress",
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
        ...mapGetters("Tools/SchoolRoutePlanning", Object.keys(getters)),
        /**
         * Getter and setter for the input address.
         */
        inputAddress: {
            /**
             * Gets the input address from the vuex state.
             * @returns {String} The input address.
             */
            get () {
                return this.$store.state.Tools.SchoolRoutePlanning.inputAddress;
            },
            /**
             * Sets the input address to the vuex state.
             * @param {String} value The input address.
             * @returns {void}
             */
            set (value) {
                this.setInputAddress(value);
            }
        },
        displaySelectOptions () {
            return this.streetNames.length > 0;
        },
        selectOptions () {
            if (!this.displaySelectOptions) {
                return [];
            }
            if (this.streetNames.length > 1) {
                return this.streetNames.slice(0, 5);
            }

            return this.filteredHouseNumbers.slice(0, 5).map(({name}) => name);
        }
    },
    methods: {
        ...mapMutations("Tools/SchoolRoutePlanning", Object.keys(mutations)),
        ...mapActions("Tools/SchoolRoutePlanning", Object.keys(actions)),
        onSelect (value) {
            if (this.streetNames.length > 1) {
                this.searchHousenumbers({
                    streetName: value,
                    eventType: "click"
                });
            }
            else {
                this.findHouseNumber({
                    input: value,
                    layer: this.layer
                });
            }
        }
    }

};
</script>

<template>
    <div class="mb-3 position-relative">
        <label
            for="tool-schoolRoutePlanning-search-address"
            class="form-label"
        >
            {{ $t('additional:modules.tools.schoolRoutePlanning.inputLabel') }}
        </label>
        <Multiselect
            id="tool-schoolRoutePlanning-search-address"
            v-model="inputAddress"
            :placeholder="inputAddress || $t('additional:modules.tools.schoolRoutePlanning.inputLabel')"
            :select-label="$t('additional:modules.tools.schoolRoutePlanning.pressEnterToSelect')"
            open-direction="bottom"
            :options="selectOptions"
            :multiple="false"
            :searchable="true"
            :loading="isLoading"
            :internal-search="false"
            :close-on-select="false"
            :show-no-results="false"
            :show-no-options="false"
            @search-change="(input) => processInput({input, layer})"
            @select="onSelect"
        />
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
</style>
