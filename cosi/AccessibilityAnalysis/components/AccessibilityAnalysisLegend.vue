<script>
export default {
    name: "AccessibilityAnalysisLegend",
    props: {
        steps: {
            type: Array,
            required: true
        },
        colors: {
            type: Array,
            required: true
        }
    },
    methods: {
        getStyleByIndex (colors, index, strokeWidth = 0.5, strokeColor = "#e3e3e3") {
            return `fill: ${colors[index]}; stroke-width: ${strokeWidth}; stroke: ${strokeColor};`;
        }
    }

};
</script>

<template lang="html">
    <v-col>
        <h5>
            {{ $t("additional:modules.tools.cosi.accessibilityAnalysis.legend") }}
        </h5>
        <div>
            <template
                v-for="(step, index) in steps"
            >
                <svg
                    :key="index"
                    width="15"
                    height="15"
                >
                    <circle
                        cx="7.5"
                        cy="7.5"
                        r="7.5"
                        :style="getStyleByIndex(colors, index)"
                    />
                </svg>
                <span :key="index * 2 + steps.length">
                    {{ step }}
                </span>
            </template>
        </div>
    </v-col>
</template>
