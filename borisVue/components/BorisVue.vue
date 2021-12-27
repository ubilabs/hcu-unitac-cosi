<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersBorisVue";
import mutations from "../store/mutationsBorisVue";


export default {
    name: "BorisVue",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/BorisVue", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
        this.initialize();
    },
    methods: {
        ...mapActions("Tools/BorisVue", [
            "initialize",
            "switchLayer"
        ]),
        ...mapMutations("Tools/BorisVue", Object.keys(mutations)),
        /**
         * Close this tool window by setting active to false
         *  @return  {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing CSS class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.BorisVue.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="boris-vue"
            >
                <!-- {{ $t("additional:modules.tools.BorisVue.content") }} -->
            </div>
            <div class="content">
                <div class="form-group col-xs-12 first">
                    <span>Die Bodenrichtwertabfrage erfolgt für das Jahr:</span>
                </div>
                <div class="form-group col-xs-12">
                    <select
                        class="form-control"
                        @change="switchLayer($event.target.value)"
                    >
                        <option
                            v-for="(model, index) in filteredModelList"
                            :key="index"
                            :value="model.get('name')"
                        >
                            {{ model.get("name") }}
                        </option>
                    </select>
                </div>
                <div class="form-group col-xs-12">
                    <span>Bitte klicken Sie nun auf den gewünschten BRW in der Karte.</span>
                </div>
            </div>
        </template>
    </Tool>
</template>


<style lang="scss" scoped>
.content {
        width: 450px;
        .first{
            padding-top: 5px;
        }
        .form-group {
            >label {
                float: left;
                width: 75%;
            }
        }
    }
</style>
