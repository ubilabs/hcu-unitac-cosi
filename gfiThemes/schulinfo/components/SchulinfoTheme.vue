<script>
import ThemeConfig from "../themeConfig.json";
import {isWebLink} from "../../../../src/utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../src/utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../src/utils/isEmailAddress.js";
import CompareFeatureIcon from "../../../../src/modules/tools/gfi/components/favoriteIcons/components/CompareFeatureIcon.vue";
import TargetSchoolIcon from "./favoriteIcons/TargetSchoolIcon.vue";

export default {
    name: "SchulinfoTheme",
    components: {
        CompareFeatureIcon,
        TargetSchoolIcon
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            assignedFeatureProperties: [],
            importedComponents: []
        };
    },
    computed: {
        /**
         * Returns the properties of the selected category.
         * @returns {Object[]} The properties for the selected category.
         */
        selectedPropertyAttributes: function () {
            return this.assignedFeatureProperties.find(property => property.isSelected === true)?.attributes;
        }
    },
    watch: {
        feature (value) {
            this.initialize(value);
        }
    },
    created () {
        this.initialize(this.feature);
        this.setImportedComponents();
    },
    methods: {
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,

        /**
         * Sets the imported components to importedComponents.
         * @returns {void}
         */
        setImportedComponents: function () {
            Object.keys(this.$options.components).forEach(componentName => {
                if (componentName !== "SchulinfoTheme") {
                    this.importedComponents.push(this.$options.components[componentName]);
                }
            });
        },

        /**
         * Checks if the feature is on the comparelist.
         * Starts to prepare the data and sets up the listener.
         * @param {Object} feature The feature from property
         * @returns {void}
         */
        initialize: function (feature) {
            this.assignedFeatureProperties = this.assignFeatureProperties(feature);
        },

        /**
         * Prepares the properties of the feature using the theme configuration.
         * @param {ol/Feature} feature The used feature.
         * @returns {Object[]} The prepared feature properties.
         */
        assignFeatureProperties: function (feature) {
            const topics = JSON.parse(JSON.stringify(ThemeConfig)).themen,
                assignedFeatureProperties = [];

            topics.forEach(topic => {
                const filteredAttributes = [];

                topic.attributes.forEach(attribute => {
                    const value = feature.getProperties()[attribute];

                    if (value !== undefined) {
                        filteredAttributes.push({
                            attributeName: feature.getAttributesToShow()[attribute],
                            attributeValue: this.beautifyAttribute(value)
                        });
                    }
                });

                topic.attributes = filteredAttributes;

                if (topic.attributes.length > 0) {
                    assignedFeatureProperties.push(topic);
                }
            });

            return assignedFeatureProperties;
        },

        /**
         * Splits the attributeValue by pipe and translates true and false.
         * @param {String} attributeValue - The attribute value.
         * @returns {String[]} The beautified attributeValues.
         */
        beautifyAttribute: function (attributeValue) {
            if (attributeValue.indexOf("|") !== -1) {
                return attributeValue.split("|");
            }
            if (attributeValue === "true" || attributeValue === "ja") {
                return [this.$t("additional:modules.tools.gfi.themes.schulinfo.yes")];
            }
            if (attributeValue === "false" || attributeValue === "nein") {
                return [this.$t("additional:modules.tools.gfi.themes.schulinfo.no")];
            }
            return [attributeValue];
        },

        /**
         * Activates the clicked category.
         * @param {Event} event click event
         * @returns {void}
         */
        toggleSelectedCategory: function (event) {
            this.assignedFeatureProperties.forEach(property => {
                if (property.name === event.target.value) {
                    property.isSelected = true;
                }
                else {
                    property.isSelected = false;
                }
            });

            this.assignedFeatureProperties = [...this.assignedFeatureProperties];
        }
    }
};
</script>

<template>
    <div class="schulinfo">
        <div class="schulinfo-head">
            <div class="btn-group btn-group-sm">
                <button
                    v-for="category in assignedFeatureProperties"
                    :key="category.name"
                    :value="category.name"
                    class="btn btn-outline-dark"
                    :class="{'btn-select': category.isSelected}"
                    @click="toggleSelectedCategory"
                >
                    {{ category.name }}
                </button>
            </div>
            <div class="favorite-container">
                <template v-for="component in importedComponents">
                    <component
                        :is="component"
                        :key="'favorite-' + component.name"
                        :feature="feature"
                    />
                </template>
            </div>
        </div>
        <div class="schulinfo-content">
            <table class="table table-condensed table-hover">
                <tbody>
                    <tr
                        v-for="attribute in selectedPropertyAttributes"
                        :key="attribute.attributeName"
                        colspan="2"
                    >
                        <td class="bold">
                            {{ attribute.attributeName }}
                        </td>
                        <td>
                            <span
                                v-for="value in attribute.attributeValue"
                                :key="value"
                            >
                                <a
                                    v-if="isWebLink(value)"
                                    :href="value"
                                    target="_blank"
                                >
                                    {{ value }}
                                </a>
                                <a
                                    v-else-if="isPhoneNumber(value)"
                                    :href="getPhoneNumberAsWebLink(value)"
                                >
                                    {{ value }}
                                </a>
                                <a
                                    v-else-if="isEmailAddress(value)"
                                    :href="`mailto:${value}`"
                                >
                                    {{ value }}
                                </a>
                                <span
                                    v-else-if="attribute.attributeName === 'Oberstufenprofil'"
                                >
                                    <b>
                                        {{ value.split(";")[0] }}
                                    </b>
                                    {{ ";" + value.split(";")[1] }}
                                </span>
                                <span v-else>
                                    {{ value }}
                                </span>
                                <br>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import "~/css/mixins.scss";
@import "~variables";

$color_2: #fec44f;
$background_color_1: rgba(227, 227, 227, 0.5);
$background_color_2: rgba(0,0,0,.5);

.schulinfo {
    max-width: 40vw;
    position: relative;
    .bold {
        td {
            font-weight: bold;
        }
    }
    td {
        font-size: 13px;
    }
    .schulinfo-head {
        display: inline-block;
        padding: 8px 0;
        background-color: $background_color_1;
        position: relative;
    }
    .btn-group-sm {
        display: block;

        .btn-outline-dark {
            margin: 4px;
            &:focus {
                @include primary_action_focus;
            }
            &:hover {
                @include primary_action_hover;
            }
        }
        padding-right: 64px;

        > button {
            font-size: 0.75rem;
        }
    }
    .favorite-container {
        position: absolute;
        right: 0;
        top: 5px;
        font-size: 0;
    }
    // NOTE: This class gets added to the button once it is selected
    .btn-select {
        color: $white;
        background-color: $background_color_2;
    }
    table {
        border-top: 1px solid rgb(229,229,229);
    }
    .bootstrap-icon {
        font-size: 28px;
        margin: 0.35em 4px 0;
    }
    .star-fill {
        color: $color_2;
    }
}
</style>
