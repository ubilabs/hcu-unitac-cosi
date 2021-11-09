<template>
  <div class="text-center">
    <v-dialog v-model="show" width="500">
      <v-card>
        <v-card-title class="text-h5 white lighten-2">
          Verteilung der Bewertungen
        </v-card-title>
        <v-container>
          <v-row align="center" justify="center">
              <Histogram
                :values="[133.57, 214.57, 446.35, 71.67]"
                :bin_count="10"
                :width="400"
                :height="300"
                :margin="30"
              />
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Histogram from "./Histogram.vue";
export default {
  props: {
    value: Boolean,
  },
  components: {
    Histogram,
  },

  mounted() {},
  computed: {
    values: [133.57, 214.57, 446.35, 71.67],
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>