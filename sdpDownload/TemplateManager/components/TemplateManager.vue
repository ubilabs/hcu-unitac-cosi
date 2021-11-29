<script>
import Tool from "../../../../src/modules/tools/Tool.vue";
import getComponent from "../../../../src/utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersTemplateManager";
import mutations from "../store/mutationsTemplateManager";
import actions from "../store/actionsTemplateManager";
import ToolInfo from "../../components/ToolInfo.vue";

export default {
    name: "TemplateManager",
    components: {
        Tool,
        ToolInfo
    },
    data () {
        return {
            templates: []
        };
    },
    computed: {
        ...mapGetters("Language", ["currentLocale"]),
        ...mapGetters("Tools/TemplateManager", Object.keys(getters)),
        ...mapGetters("Tools/SaveSession", []),
        ...mapGetters("Tools/DistrictSelector", ["districtLevels"]),
        ...mapGetters("Tools/FeaturesList", ["flatLayerMapping"])
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
        },

        getActiveLayerList (template) {
            return this.flatLayerMapping
                .filter(layer => (template.state?.Map?.layerIds || []).includes(layer.layerId))
                .map(layerMap => layerMap.id);
        },

        getActiveTool (template) {
            const id = Object.entries(template.state.Tools).find(tool => tool[1].active)?.[0];

            return this.$store.getters[`Tools/${id}/name`];
        },

        getActiveDistrictLevel (template) {
            const layerId = template.state.Tools?.DistrictSelector?.selectedDistrictLevelId;

            return this.districtLevels.find(districtLevel => districtLevel.layerId === layerId)?.label;
        },

        getSelectedDistricts (template) {
            return template.state.Tools?.DistrictSelector?.selectedDistrictNames || [];
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
            <v-app class="clamp-40vw">
                <v-container>
                    <ToolInfo
                        :url="readmeUrl[currentLocale]"
                    />
                    <v-subheader>
                        {{ $t("additional:modules.tools.cosi.templateManager.infoLoadFromTemplates") }}
                    </v-subheader>
                    <v-divider />
                    <div>
                        <span class="text-subtitle-2">
                            {{ $t("additional:modules.tools.cosi.templateManager.loadFromTemplate") }}
                        </span>
                    </div>
                    <v-list dense>
                        <v-list-group
                            v-for="(template, i) in templates"
                            :key="i"
                            color="primary"
                            :prepend-icon="template.meta.icon"
                            no-action
                        >
                            <template #activator>
                                <v-list-item-content>
                                    <v-list-item-title v-text="template.meta.title" />
                                </v-list-item-content>
                            </template>

                            <v-list-item>
                                <v-list-item-content class="no-flex">
                                    <v-row>
                                        <v-simple-table
                                            class="info-table"
                                            dense
                                        >
                                            <template #default>
                                                <tbody>
                                                    <tr>
                                                        <th v-text="$t('additional:modules.tools.cosi.templateManager.created')" />
                                                        <td v-text="template.meta.created" />
                                                    </tr>
                                                    <tr>
                                                        <th v-text="$t('additional:modules.tools.cosi.templateManager.info')" />
                                                        <td v-html="template.meta.info || $t('additional:modules.tools.cosi.templateManager.noInfo')" />
                                                    </tr>
                                                    <tr>
                                                        <th v-text="$t('additional:modules.tools.cosi.templateManager.layers')" />
                                                        <td>
                                                            <v-chip
                                                                v-for="layerId in getActiveLayerList(template)"
                                                                :key="template.meta.title + layerId"
                                                                class="ma-1"
                                                                small
                                                            >
                                                                {{ layerId }}
                                                            </v-chip>
                                                        </td>
                                                    </tr>
                                                    <tr v-if="getActiveDistrictLevel(template)">
                                                        <th>
                                                            {{ $t("additional:modules.tools.cosi.templateManager.districtLevel") }}
                                                        </th>
                                                        <td>
                                                            {{ getActiveDistrictLevel(template) }}
                                                        </td>
                                                    </tr>
                                                    <tr v-if="getSelectedDistricts(template).length > 0">
                                                        <th>
                                                            {{ $t("additional:modules.tools.cosi.templateManager.selectedDistricts") }}
                                                        </th>
                                                        <td>
                                                            <v-chip
                                                                v-for="districtName in getSelectedDistricts(template)"
                                                                :key="template.meta.title + districtName"
                                                                class="ma-1"
                                                                small
                                                            >
                                                                {{ districtName }}
                                                            </v-chip>
                                                        </td>
                                                    </tr>
                                                    <tr v-if="getActiveTool(template)">
                                                        <th>
                                                            {{ $t("additional:modules.tools.cosi.templateManager.activeTool") }}
                                                        </th>
                                                        <td>
                                                            {{ getActiveTool(template) }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </template>
                                        </v-simple-table>
                                    </v-row>
                                    <v-divider />
                                    <v-row justify="end">
                                        <v-col class="right-text">
                                            <v-btn
                                                id="load"
                                                dense
                                                small
                                                tile
                                                color="grey lighten-1"
                                                :title="$t('additional:modules.tools.cosi.saveSession.infoLoadFromTemplates')"
                                                @click="loadFromTemplate(template)"
                                            >
                                                <v-icon left>
                                                    mdi-open-in-app
                                                </v-icon>
                                                {{ $t('additional:modules.tools.cosi.saveSession.loadFromTemplate') }}
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-group>
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
    .info-table {
        max-width: 550px;
    }
    .no-flex {
        display: block;
    }
</style>
