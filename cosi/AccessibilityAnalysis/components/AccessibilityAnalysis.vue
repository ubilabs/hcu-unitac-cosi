<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import Dropdown from "../../../../src/share-components/dropdowns/DropdownSimple.vue";
import { mapGetters, mapMutations } from "vuex";
import getters from "../store/gettersAccessibilityAnalysis";
import mutations from "../store/mutationsAccessibilityAnalysis";
import PointAnalsysis from "./PointAnalysis.vue";

export default {
  name: "AccessibilityAnalysis",
  components: {
    Tool,
    Dropdown,
    PointAnalsysis,
  },
  data() {
    return {
      // The selected mode for accessibility analysis
      selectedMode: null,
    };
  },
  computed: {
    ...mapGetters("Tools/AccessibilityAnalysis", Object.keys(getters)),
  },
  watch: {
    selectedMode() {
      console.log(this.selectedMode);
    },
  },
  created() {
    this.$on("close", this.close);
  },
  /**
   * Put initialize here if mounting occurs after config parsing
   * @returns {void}
   */
  mounted() {
    this.applyTranslationKey(this.name);
  },
  methods: {
    ...mapMutations("Tools/AccessibilityAnalysis", Object.keys(mutations)),

    /**
     * Closes this tool window by setting active to false
     * @returns {void}
     */
    close() {
      this.setActive(false);

      // TODO replace trigger when Menu is migrated
      // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
      // else the menu-entry for this tool is always highlighted
      const model = Radio.request("ModelList", "getModelByAttributes", {
        id: this.$store.state.Tools.AccessibilityAnalysis.id,
      });

      if (model) {
        model.set("isActive", false);
      }
    },
  },
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="accessibilityanalysis"
            >
                <p>Bitte wählen Sie den Modus, in dem Sie arbeiten möchten: </p>
                <Dropdown
                    v-model="selectedMode"
                    :options="availableModes"
                />
                <p><strong>1) Erreichbarkeit ab einem Referenzpunkt</strong>: Zeigt ein Gebiet an, welches von einem vom Nutzer
                    gewählten Punkt auf der Karte innerhalb einer vom Nutzer festgelegten Entfernung erreichbar ist. Die Entfernung
                    kann in Zeit oder in Metern angegeben werden. Die Erreichbarkeit wird berechnet abhängig von dem vom Nutzer
                    festgelegten Verkehrsmittel.
                    <br />
                    <strong>2) Erreichbarkeit im Gebiet</strong>: Zeigt die Abdeckung und Erreichbarkeit von einer zuvor
                    festgelegten Einrichtungsart (z.B. Kindergärten) in dem von dem Nutzer festgelegten Einzugsbereich. Der
                    Einzugsbereich ist die Entfernung von der jeweiligen Einrichtung und kann angegeben werden in Zeit oder in
                    Metern. Die Erreichbarkeit wird berechnet abhängig von dem vom Nutzer festgelegten Verkehrsmittel.
                </p>
                <PointAnalsysis
                    v-if="selectedMode == 'point'"
                />
                <div
                    v-if="selectedMode == 'region'"
                >
                    region
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less">
#accessibilityanalysis {
  min-width: 300px;
  max-width: 500px;
  min-height: 100px;
}
</style>