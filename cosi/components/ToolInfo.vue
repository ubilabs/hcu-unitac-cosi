<script>
import {mapActions} from "vuex";

export default {
    name: "ToolInfo",
    props: {
        title: {
            type: String,
            default: "Werkzeuginformationen (Link öffnen)"
        },
        url: {
            type: String,
            default: null
        },
        infoText: {
            type: String,
            default: undefined
        },
        summary: {
            type: String,
            default: null
        }
    },
    methods: {
        ...mapActions("Alerting", ["addSingleAlert", "cleanup"]),

        showInfo () {
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

            return null;
        }
    }
};
</script>

<template>
    <div v-if="url || infoText">
        <v-row
            dense
            justify="end"
        >
            <v-col
                cols="17"
            >
                <p
                    v-if="summary"
                >
                    {{ summary }}
                </p>
            </v-col>
            <v-col
                cols="1"
            >
                <v-btn
                    :title="title"
                    class="info_btn"
                    depressed
                    right
                    icon
                    x-small
                    @click="showInfo"
                >
                    <v-icon>mdi-help-circle</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-divider />
    </div>
</template>

<style lang="less" scoped>
    .info_btn {
        margin: 0 0 0 auto;
    }
</style>
