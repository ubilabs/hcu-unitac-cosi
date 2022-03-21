<script>
import {mapActions} from "vuex";
import componentExists from "../../../../../src/utils/componentExists.js";

export default {
    name: "TargetSchoolIcon",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            id: "schoolRoutePlanning"
        };
    },
    methods: {
        ...mapActions("Tools", ["setToolActive"]),
        ...mapActions("Tools/SchoolRoutePlanning", ["selectInitializeSchoolNumber"]),
        componentExists,

        /**
         * Sets the schulwegrouting tool active,
         * takes over the school for the routing and close the gfi.
         * @param {Event} event The click or keydown event.
         * @returns {void}
         */
        takeRoute: function (event) {
            Radio.trigger("ModelList", "setModelAttributesById", this.id, {isActive: true});
            this.setToolActive({id: this.id, active: true});
            this.selectInitializeSchoolNumber(this.feature.getProperties().schul_id);
            this.$parent.$parent.close(event);
        }
    }
};
</script>

<template>
    <span
        v-if="componentExists(id)"
        class="bootstrap-icon"
        :title="$t('additional:modules.tools.gfi.themes.schulinfo.favoriteicons.adoptedTargetSchool')"
        @click="takeRoute"
        @keydown.enter="takeRoute"
    >
        <i class="geo-alt-fill" />
    </span>
</template>
