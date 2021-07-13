
<script>
import LayerFilterResult from "./LayerFilterResult.vue";

export default {
    name: "DashboardResult",
    components: {
        LayerFilterResult
    },
    props: {
        layerFilterModels: {
            type: Array,
            default: null
        },
        districtNames: {
            type: Array,
            default: null
        },
        i18n: {
            type: Object,
            default: null
        }
    }
};
</script>

<template lang="html">
    <div>
        <template
            v-for="filter in layerFilterModels"
        >
            <LayerFilterResult
                :key="filter.layerId"
                v-bind="{...filter, i18n}"
            />
        </template>
        <p><strong>{{ i18n['comparableResults'] }}: </strong></p>

        <span
            v-for="name in districtNames"
            :key="name"
            class="name-tag district-name"
        >{{ name }}</span>
    </div>
</template>

<style lang="less" scoped>
</style>


