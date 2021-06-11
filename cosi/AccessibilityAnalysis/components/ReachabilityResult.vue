
<script>
import {mapActions, mapMutations} from "vuex";

export default {
    name: "ReachabilityResult",
    props: {
        layers: {type: Array, default: () => []}
    },
    data () {
        return {
            layerOpen: {}
        };
    },
    methods: {
        ...mapActions("MapMarker", ["placingPointMarker"]),
        ...mapMutations("Map", ["setCenter"]),
        /**
     * shows facility group table rows
     * @param {object} name click event
     * @return {void}
     */
        toggleGroup: function (name) {
            this.layerOpen = {...this.layerOpen, [name]: !this.layerOpen[name]};
        },
        /**
     * sets viewport center to the isochrone
     * @param {object} coord - click event
     * @fires Core#RadioTriggerMapViewSetCenter
     * @return {void}
     */
        zoomToOrigin: function (coord) {
            this.placingPointMarker(coord);
            this.setCenter(coord);
        }
    }
};
</script>

<template>
    <table class="table table-hover">
        <tr>
            <th scope="col">
                Art der Infrastruktur
            </th>
            <th scope="col">
                Menge
            </th>
        </tr>
        <template v-for="(layer, i) in layers">
            <tr
                :key="layer.layerId"
                class="dashboard-tr"
            >
                <td
                    scope="row"
                    v-html="layer.layerName"
                />
                <td>
                    {{ layer.features.length }}
                    <button
                        v-if="layer.features.length"
                        type="button"
                        class="btn btn-outline-secondary open"
                        @click="toggleGroup(layer.layerId)"
                    >
                        <span></span>
                    </button>
                </td>
            </tr>
            <tr
                v-if="layerOpen[layer.layerId]"
                :key="i"
            >
                <td colspan="3">
                    <p>
                        <span
                            v-for="(feature, j) in layer.features"
                            :key="j + 'f'"
                            class="name-tag district-name"
                            @click="zoomToOrigin(feature[1])"
                            v-html="feature[0]"
                        />
                    </p>
                </td>
            </tr>
        </template>
    </table>
</template>

<style lang="less">
</style>
