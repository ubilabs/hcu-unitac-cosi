<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getComponent from "../../../src/utils/getComponent";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";
import getters from "../store/gettersStreetSmart";
import mutations from "../store/mutationsStreetSmart";

export default {
    name: "StreetSmart",
    components: {
        ToolTemplate
    },
    data () {
        return {
            apiIsLoaded: false
        };
    },
    computed: {
        ...mapGetters("Tools/StreetSmart", Object.keys(getters)),
        ...mapGetters("Map", ["clickCoord"]),
        ...mapGetters("MapMarker", ["markerPoint"])
    },
    watch: {
        active (value) {
            if (value) {
                this.$nextTick(() => {
                    if (this.apiIsLoaded) {
                        this.initApi();
                    }
                });
            }
            else {
                this.close();
            }
        },
        clickCoord (newCoord, lastCoord) {
            if (newCoord !== lastCoord) {
                this.setPosition(newCoord);
            }
        },
        "markerPoint.values_.visible": function (visible) {
            if (this.active && visible) {
                const features = this.markerPoint.getSource().getFeatures();

                if (features && features[0]) {
                    this.setPosition(features[0].getGeometry().getCoordinates());
                }
            }
        }
    },
    async created () {
        await this.loadPackages(this.apiLoadFinished);
        this.$on("close", this.close);
    },

    methods: {
        ...mapMutations("Tools/StreetSmart", Object.keys(mutations)),
        ...mapActions("Tools/StreetSmart", ["loadPackages", "initApi", "setPosition", "destroyApi"]),

        apiLoadFinished () {
            this.apiIsLoaded = true;
            if (this.active) {
                this.initApi();
            }
        },

        close () {
            const model = getComponent("streetsmart");

            this.destroyApi();
            this.setActive(false);
            if (model) {
                model.set("isActive", false);
            }
        }
    }
};

</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="initialWidth"
    >
        <template #toolBody>
            <div
                v-if="!apiIsLoaded"
                id="sidebarloader"
                class="centered-box-wrapper loader-is-loading"
            >
                <div
                    id="loader-spinner-itself"
                    class="default"
                />
            </div>
            <div
                v-if="active"
                id="streetsmart"
            />
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
#streetsmart{
    height: 84vh;
}
#sidebarloader {
    position:absolute;
    top:0;
    right:0;
    bottom:0;
    left:0;
    background-color:rgba(255,255,255,0.4);
    display:none;
    padding-bottom:100px;
    z-index:1000;
}
#sidebarloader.loader-is-loading {
    display:block;
}
</style>