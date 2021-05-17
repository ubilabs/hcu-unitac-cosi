<script>
export default {
    name: "ExportButton",
    props: {},
    methods: {

    }
}
</script>

<template>
    <v-col cols="12">
        <v-btn
            tile
            depressed
            :disabled="!activeScenario"
            :title="$t('additional:modules.tools.cosi.scenarioBuilder.restoreAllFeatures')"
            @click="activeScenario.restore()"
        >
            {{ $t('additional:modules.tools.cosi.scenarioBuilder.restoreAllFeatures') }}
        </v-btn>
        <v-btn
            tile
            depressed
            :disabled="!activeScenario"
            :title="$t('additional:modules.tools.cosi.scenarioBuilder.pruneAllFeatures')"
            @click="pruneActiveScenario"
        >
            {{ $t('additional:modules.tools.cosi.scenarioBuilder.pruneAllFeatures') }}
        </v-btn>
        <label v-if="!activeScenario">
            {{ $t('additional:modules.tools.cosi.scenarioBuilder.noActiveScenario') }}
        </label>
    </v-col>
</template>