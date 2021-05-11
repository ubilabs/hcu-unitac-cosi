
<script>
import { mapActions } from "vuex";

export default {
  name: "ReachabilityResult",
  props: {
    layers: { type: Array, default: [] },
  },
  data() {
    return {
      layerOpen: {},
    };
  },
  methods: {
    ...mapActions("MapMarker", ["placingPointMarker"]),
    /**
     * shows facility group table rows
     * @param {object} evt click event
     * @return {void}
     */
    toggleGroup: function (name) {
      this.layerOpen = { ...this.layerOpen, [name]: !this.layerOpen[name] };
    },
    /**
     * sets viewport center to the isochrone
     * @param {object} evt - click event
     * @fires Core#RadioTriggerMapViewSetCenter
     * @return {void}
     */
    zoomToOrigin: function (coord) {
      this.placingPointMarker(coord)
      Radio.trigger("MapView", "setCenter", coord);
    },
  },
};
</script>
<template>
  <table class="table table-hover">
    <tr>
      <th scope="col">Art der Infrastruktur</th>
      <th scope="col">Menge</th>
    </tr>
    <template v-for="(layer, i) in layers">
      <tr :key="layer.layerId" class="dashboard-tr">
        <td v-html="layer.layerName" scope="row" />
        <td>
          {{ layer.features.length }}
          <button
            v-if="layer.features.length"
            @click="toggleGroup(layer.layerId)"
            type="button"
            class="btn btn-outline-secondary open"
          >
            <span></span>
          </button>
        </td>
      </tr>
      <tr v-if="layerOpen[layer.layerId]" :key="i">
        <td colspan="3">
          <p>
            <span
              v-for="(feature, i) in layer.features"
              @click="zoomToOrigin(feature[1])"
              :key="i + 'f'"
              class="name-tag district-name"
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