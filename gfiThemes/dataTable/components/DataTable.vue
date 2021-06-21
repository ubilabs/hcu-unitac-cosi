<script>

import {mapGetters} from "vuex";
import getters from "../../../../src/modules/tools/gfi/store/gettersGfi";
import {isWebLink} from "../../../../src/utils/urlHelper.js";

export default {
    name: "DataTable",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        refinedData: function () {
            const result = {
                head: [],
                rows: []
            };

            this.feature.getFeatures().forEach(singleFeature => {

                const mappedProps = singleFeature.getMappedProperties();

                Object.keys(mappedProps).forEach(attrKey => {
                    if (mappedProps[attrKey] !== undefined && typeof mappedProps[attrKey] === "string" && result.head.indexOf(attrKey) === -1) {
                        result.head.push(attrKey);
                    }
                });

                result.rows.push(mappedProps);
            });

            return result;
        }
    },
    methods: {
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        isWebLink,
    }
};
</script>

<template>
    <div id="table-data-container">
        <table
            v-if="refinedData.rows.length > 0"
            class="table table-hover"
        >
            <thead>
                <th
                    v-for="propNameKey in refinedData.head"
                    :key="propNameKey"
                >
                    {{ propNameKey }}
                </th>
            </thead>

            <tbody>
                <tr
                    v-for="(singleRow, index1) in refinedData.rows"
                    :key="index1"
                >
                    <td
                        v-for="(propKey, index2) in refinedData.head"
                        :key="index2"
                    >
                        <a
                            v-if="isWebLink(singleRow[propKey])"
                            :href="singleRow[propKey]"
                            target="_blank"
                        >
                            {{ singleRow[propKey] ? singleRow[propKey] : '' }}
                        </a>
                        <span v-else>
                            {{ singleRow[propKey] ? singleRow[propKey] : '' }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";

#table-data-container {
    margin:6px 15px 0 12px;

    table {
        margin: 0;

        td, th {
            padding: 6px;
        }
    }
}
</style>
