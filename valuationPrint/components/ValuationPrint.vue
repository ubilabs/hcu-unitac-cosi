<script>
import {Fill, Stroke, Style} from "ol/style";
import getComponent from "../../../src/utils/getComponent";
import getters from "../store/gettersValuationPrint";
import Feature from "ol/Feature";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../store/mutationsValuationPrint";
import {Select} from "ol/interaction";
import {singleClick} from "ol/events/condition";
import ToolTemplate from "../../../src/modules/tools/ToolTemplate.vue";

export default {
    name: "ValuationPrint",
    components: {
        ToolTemplate
    },
    computed: {
        ...mapGetters("Tools/ValuationPrint", Object.keys(getters))
    },
    watch: {
        /**
         * Activates the select interaction if the tool is active, ohterwise it is deactivated.
         * @param {Boolean} newValue - If the tool is active or not.
         * @returns {void}
         */
        active (newValue) {
            this.select.setActive(newValue);
        }
    },
    created () {
        this.setSelectInteraction();

        this.$on("close", () => {
            this.setActive(false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        });
    },
    methods: {
        ...mapMutations("Tools/ValuationPrint", Object.keys(mutations)),
        ...mapActions("Maps", ["addInteraction"]),

        /**
         * Removes the passed feature from the collection where the select interaction will place the selected features.
         * @param {ol/Feature} feature - The feature to be removed.
         * @returns {void}
         */
        removeFeature (feature) {
            if (feature instanceof Feature) {
                this.select.getFeatures().remove(feature);
            }
        },

        /**
         * Sets the select interaction (non-reactive state), adds it a "change:active" listener and adds it to the map.
         * @returns {void}
         */
        setSelectInteraction () {
            this.select = new Select({
                layers: (layer) => layer.get("id") === this.parcelLayerId,
                style: new Style({
                    fill: new Fill({
                        color: "rgba(255,255,255,0)"
                    }),
                    stroke: new Stroke({
                        color: "#de2d26",
                        width: 5
                    })
                }),
                addCondition: singleClick,
                removeCondition: singleClick
            });

            this.select.on("change:active", this.styleSelectedFeatures);
            this.addInteraction(this.select);
        },

        /**
         * Sets the style of the selected features depending on the activity of the select interaction.
         * If the interaction is active, all existing featurers are styled using the select interaction style.
         * If it is not, the layer style is used.
         * @param {ol/Object.ObjectEvent} evt - OpenLayers Object Event.
         * @param {String} evt.key - The name of the property whose value is changing.
         * @param {ol/interaction/Select} evt.target - The event target. In this case the select interaction.
         * @returns {void}
         */
        styleSelectedFeatures ({key, target}) {
            const features = target.getFeatures();

            if (target.get(key)) {
                features.forEach(feature => {
                    feature.setStyle(target.getStyle());
                });
            }
            else {
                features.forEach(feature => {
                    feature.setStyle(false);
                });
            }
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
    >
        <template
            v-if="active"
            #toolBody
        >
            <div class="valuation-print">
                <div
                    v-for="feature in select.getFeatures().getArray()"
                    :key="feature.get('flstnrzae')"
                >
                    <ul class="list-inline">
                        <li class="list-inline-item">
                            Flurstück:
                        </li>
                        <li class="list-inline-item">
                            {{ feature.get("flstnrzae") }}
                        </li>
                        <li class="list-inline-item">
                            Gemarkung:
                        </li>
                        <li class="list-inline-item">
                            {{ feature.get("gemarkung") }}
                        </li>
                    </ul>
                    <div class="mt-2">
                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            @click="removeFeature(feature)"
                        >
                            Entfernen
                        </button>
                    </div>
                    <hr>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>

</style>
