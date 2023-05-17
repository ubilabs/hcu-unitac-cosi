<script>
import beautifyKey from "../../../../src/utils/beautifyKey.js";
import {isWebLink} from "../../../../src/utils/urlHelper.js";
import {translateKeyWithPlausibilityCheck} from "../../../../src/utils/translateKeyWithPlausibilityCheck.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../src/utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../src/utils/isEmailAddress.js";
import {getPropertiesWithFullKeys} from "../../../../src/modules/tools/gfi/utils/getPropertiesWithFullKeys.js";

export default {
    name: "WholeCityTheme",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            beautifyKeysParam: true,
            showObjectKeysParam: false
        };
    },
    computed: {
        linkPrefix: function () {
            return this.feature?.getTheme()?.params?.linkPrefix || "";
        },

        linkHrefKey: function () {
            return this.feature?.getTheme()?.params?.linkHrefKey || "";
        },

        linkTextKey: function () {
            return this.feature?.getTheme()?.params?.linkTextKey || "";
        },

        getMappedPropertiesOfFeature: function () {
            if (this.showObjectKeysParam === true) {
                const properties = getPropertiesWithFullKeys(this.feature.getMappedProperties());

                return properties !== false ? properties : {};
            }

            return this.feature.getMappedProperties();
        },

        getMappedGfiPropertiesOfFeature: function () {
            const properties = Object.assign({}, this.getMappedPropertiesOfFeature);

            if (this.linkHrefKey !== "") {
                delete properties[this.linkHrefKey];
            }
            return properties;
        }
    },
    mounted () {
        this.setMaxHeight();
    },
    methods: {
        beautifyKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        translateKeyWithPlausibilityCheck,

        /**
         * checks if given feature has a function getMappedProperties
         * @param {Object} feature the current feature to check
         * @return {Boolean} returns true if given feature has a function getMappedProperties
         */
        mappedPropertiesExists (feature) {
            return typeof feature === "object" && feature !== null && typeof feature.getMappedProperties === "function";
        },

        /**
         * checks if the given feature has one or more mapped properties
         * @param {Object} feature the current feature to check
         * @returns {Boolean} returns true if feature has mapped properties
         */
        hasMappedProperties (feature) {
            return this.mappedPropertiesExists(feature) && Object.keys(feature.getMappedProperties()).length !== 0;
        },
        /**
         * checks if the string has a pipe.
         * @param {string} value string to check.
         * @returns {boolean} whether the given value includes a pipe.
         */
        hasPipe: function (value) {
            return typeof value === "string" && value.includes("|");
        },
        /**
         * Sets max height for current gfi window
         * @returns {void}
         */
        setMaxHeight () {
            if (document.querySelector(".vue-tool-content-body .body")) {
                document.querySelector(".vue-tool-content-body .body").style.maxHeight = "600px";
            }
        },
        /**
         * Gets the link url for each link text
         * @param {string} linkPrefix the prefix for the url
         * @param {string} linkHrefKey the link href key
         * @param {Number} index the index after diving with pipe
         * @returns {String} the link url
         */
        getLink (linkPrefix, linkHrefKey, index) {
            if (typeof index !== "number" || typeof linkHrefKey !== "string" || typeof linkHrefKey !== "string") {
                return "";
            }

            const linkProperties = this.getMappedPropertiesOfFeature[linkHrefKey];

            if (this.hasPipe(linkProperties)) {
                return linkPrefix + linkProperties.split("|")[index];
            }

            return "";
        }
    }
};
</script>

<template>
    <table
        v-if="feature"
        class="table table-condensed table-hover outerTable"
    >
        <tbody v-if="mappedPropertiesExists(feature)">
            <tr v-if="!hasMappedProperties(feature)">
                <td class="bold">
                    {{ $t("modules.tools.gfi.themes.default.noAttributeAvailable") }}
                </td>
            </tr>
            <tr
                v-for="(value, key) in getMappedGfiPropertiesOfFeature"
                v-else
                :key="key"
            >
                <td
                    class="bold firstCol"
                >
                    <span v-if="beautifyKeysParam">
                        {{ beautifyKey(translateKeyWithPlausibilityCheck(key, v => $t(v))) }}
                    </span>
                    <span v-else>
                        {{ key }}
                    </span>
                </td>
                <td v-if="isWebLink(value)">
                    <a
                        :href="value"
                        target="_blank"
                    >Link</a>
                </td>
                <td v-else-if="isPhoneNumber(value)">
                    <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                </td>
                <td v-else-if="isEmailAddress(value)">
                    <a :href="`mailto:${value}`">{{ value }}</a>
                </td>
                <td
                    v-else-if="Array.isArray(value)"
                    v-html="value.join('<br>')"
                />
                <td v-else-if="hasPipe(value) && key !== linkTextKey">
                    <p
                        v-for="(splitValue, splitKey) in value.split('|')"
                        :key="splitKey"
                    >
                        {{ splitValue }}
                    </p>
                </td>
                <td v-else-if="hasPipe(value) && key === linkTextKey">
                    <ul>
                        <li
                            v-for="(splitValue, splitKey) in value.split('|')"
                            :key="splitKey"
                        >
                            <a
                                :href="getLink(linkPrefix, linkHrefKey, splitKey)"
                                target="_blank"
                            >
                                {{ splitValue }}
                            </a>
                        </li>
                    </ul>
                </td>
                <td
                    v-else-if="typeof value === 'string' && value.includes('<br>')"
                    v-html="value"
                />
                <td v-else>
                    {{ value }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style lang="scss" scoped>
    @import "~variables";

    th {
        font-family: $font_family_accent;
        background-color: $secondary_table_style;
    }

    td.outerTable {
        padding: 0px;
    }
    table.innerTable {
        width: 100%;
        margin-bottom: 0px;
    }
    table.innerTable td {
        padding: 8px;
    }
    td.firstCol {
        width: 33%;
        font-weight: bold;
        font-family: $font_family_accent;
    }
    td:not(.firstCol) {
        width: 67%;
        text-align: left;
        ul {
            margin-bottom: 0;
            padding-left: 14px;
            li::marker {
                color: $link-color;
            }
        }
    }
</style>
