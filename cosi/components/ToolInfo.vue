<script>
import {mapActions} from "vuex";

export default {
    name: "ToolInfo",
    props: {
        title: {
            type: String,
            default: "Werkzeuginformationen"
        },
        url: {
            type: String,
            default: null
        },
        infoText: {
            type: String,
            required: true
        }
    },
    methods: {
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),
        showHelp () {
            if (this.url) {
                return window.open(this.url, "_blank");
            }

            if (this.infoText) {
                this.cleanup();
                this.addSingleAlert({
                    category: "Info",
                    content: this.infoText,
                    displayClass: "info"
                });
            }
        }
    }
};
</script>

<template>
    <div>
        <v-row
            v-if="url || infoText"
            dense
            justify="end"
        >
            <v-btn
                :title="title"
                depressed
                right
                icon
                x-small
                @click="showHelp"
            >
                <v-icon>mdi-help-circle</v-icon>
            </v-btn>
        </v-row>
        <v-divider />
    </div>
</template>

<style lang="less" scoped>

</style>
