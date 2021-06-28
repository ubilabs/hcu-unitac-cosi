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
         * @returns {void}
         */
        takeRoute: function () {
            Radio.trigger("ModelList", "setModelAttributesById", this.id, {isActive: true});
            this.setToolActive({id: this.id, active: true});
            this.selectInitializeSchoolNumber(this.feature.getProperties().schul_id);
            this.$parent.$parent.close();
        }
    }
};
</script>

<template>
    <span
        v-if="componentExists(id)"
        class="glyphicon glyphicon-map-marker"
        :title="$t('additional:modules.tools.gfi.themes.schulinfo.favoriteicons.adoptedTargetSchool')"
        @click="takeRoute"
    />
</template>

<style lang="less" scoped>

</style>
