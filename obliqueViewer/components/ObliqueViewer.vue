<script>
import Vue from "vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getComponent from "../../../src/utils/getComponent";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersObliqueViewer";
import mutationsObliqueViewer from "../store/mutationsObliqueViewer";
import iframeResize from "../node_modules/iframe-resizer/js/iframeResizer";

Vue.directive("resize", {
    bind: function (el, {value = {}}) {
        el.addEventListener("load", () => iframeResize(value, el));
    },
    unbind: function (el) {
        el.iFrameResizer.removeListeners();
    }
});

export default {
    name: "ObliqueViewer",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/ObliqueViewer", Object.keys(getters)), // nur die die genutzt werden
        ...mapGetters("Maps", ["center", "initialCenter", "clickCoordinate"])
    },
    watch: {
        active (value) {
            if (value) {
                this.$nextTick(() => {
                    this.initObliqueView();
                });
            }
        },
        clickCoordinate (value) {
            this.setObliqueView(value.coordinate);
        }
    },
    created () {
        this.$on("close", this.close);
    },
    mounted () {
        this.$nextTick(() => {
            this.setObliqueViewerURL(this.initialCenter);
            this.initObliqueView();
        });
    },
    methods: {
        ...mapMutations("Tools/ObliqueViewer", Object.keys(mutationsObliqueViewer)),
        ...mapActions("Tools/ObliqueViewer", ["initObliqueView", "setObliqueView", "setObliqueViewerURL"]),
        ...mapActions("MapMarker", ["removePointMarker"]),

        close () {
            const model = getComponent("obliqueViewer");

            this.setActive(false);
            if (model) {
                model.set("isActive", false);
            }
            this.removePointMarker();
        }
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
        :deactivate-gfi="deactivateGFI"
        :initial-width="initialWidth"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="obliqueViewer"
            >
                <iframe
                    id="obliqueIframe"
                    ref="iframeContent"
                    v-resize="{}"
                    title="ObliqueIframe"
                    width="100%"
                    height="100%"
                    frameboarder="0"
                    :src="obliqueViewerURL"
                />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
#obliqueViewer{
    height: 84vh;
}
</style>

