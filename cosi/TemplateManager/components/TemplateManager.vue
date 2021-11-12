<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersTemplateManager";
import mutations from "../store/mutationsTemplateManager";
import actions from "../store/actionsTemplateManager";

export default {
    name: "TemplateManager",
    components: {
        Tool
    },
    data () {
        return {
            templates: []
        };
    },
    computed: {
        ...mapGetters("Tools/TemplateManager", Object.keys(getters)),
        ...mapGetters("Tools/SaveSession", [])
    },
    watch: {
        /**
         * Unselect the Menu item if the tool is deactivated
         * @param {boolean} state - Defines if the tool is active.
         * @returns {void}
         */
        active (state) {
            if (!state) {
                const model = getComponent(this.id);

                if (model) {
                    model.set("isActive", false);
                }
            }
        }
    },
    created () {
        /**
         * listens to the close event of the Tool Component
         * @listens #close
         */
        this.$on("close", () => {
            this.setActive(false);
        });
    },
    mounted () {
        this.loadTemplates();
    },
    methods: {
        ...mapMutations("Tools/TemplateManager", Object.keys(mutations)),
        ...mapActions("Tools/TemplateManager", Object.keys(actions)),
        ...mapActions("Tools/SaveSession", ["loadSessionData"]),

        async loadTemplates () {
            let path, res;
            const templates = [];

            for (const filename of this.templateFiles) {
                path = `${this.templatePath}/${filename}.json`;

                try {
                    res = await fetch(path);
                    templates.push(await res.json());
                }
                catch (e) {
                    console.warn(`Template at ${path} could not be loaded. Please check that it is a valid JSON file.`);
                }
            }

            this.templates = templates;
        },

        loadFromTemplate (template) {
            this.setActive(false);
            this.loadSessionData(template);
        },

        showTemplateInfo (template) {
            this.addSingleAlert({
                content: template.meta?.info,
                category: "Info",
                displayClass: "info"
            });
        }
    }
};
</script>

<template lang="html">
    <Tool
        ref="tool"
        :title="$t('additional:modules.tools.cosi.templateManager.title')"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template
            v-if="active"
            #toolBody
        >
            <v-app>
                <v-container>
                    <v-card-title primary-title>
                        <v-icon
                            class="template-info-button"
                        >
                            mdi-file-cog
                        </v-icon>
                        {{ $t("additional:modules.tools.cosi.templateManager.loadFromTemplate") }}
                    </v-card-title>
                    <v-subheader>
                        {{ $t("additional:modules.tools.cosi.templateManager.infoLoadFromTemplates") }}
                    </v-subheader>
                    <v-list dense>
                        <v-list-item-group
                            color="primary"
                        >
                            <v-list-item
                                v-for="(template, i) in templates"
                                :key="i"
                                @click="loadFromTemplate(template)"
                            >
                                <v-list-item-icon>
                                    <v-tooltip left>
                                        <template #activator="{ on, attrs }">
                                            <v-icon
                                                class="template-info-button"
                                                v-bind="attrs"
                                                v-on="on"
                                            >
                                                mdi-help-circle
                                            </v-icon>
                                        </template>
                                        {{ template.meta ? template.meta.info : $t("additional:modules.tools.cosi.templateManager.noInfo") }}
                                    </v-tooltip>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title v-text="template.meta.title" />
                                    <v-list-item-subtitle v-text="template.meta.created" />
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-container>
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "../../utils/variables.less";

    .hidden {
        display: hidden;
    }

    .template-info-button {
        margin-right: 20px;
    }
</style>
