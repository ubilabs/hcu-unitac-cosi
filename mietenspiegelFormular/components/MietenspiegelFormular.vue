<script>
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersMietenspiegelFormular";
import mutations from "../store/mutationsMietenspiegelFormular";


export default {
    name: "MietenspiegelFormular",
    components: {
        ToolTemplate
    },
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters("Tools/MietenspiegelFormular", Object.keys(getters))
    },
    created () {
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    methods: {
        ...mapMutations("Tools/MietenspiegelFormular", Object.keys(mutations))
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
    >
        <template
            v-if="active"
            #toolBody
        >
            <div class="mietenspiegel-formular">
                Test
            </div>
        </template>
    </ToolTemplate>
</template>

<style>

</style>
