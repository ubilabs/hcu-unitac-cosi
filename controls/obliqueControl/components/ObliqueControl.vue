<script>
import {mapActions} from "vuex";
import ControlIcon from "../../../../src/modules/controls/ControlIcon.vue";


export default {
    name: "ObliqueControl",
    components: {
        ControlIcon
    },
    props: {
        /** the title in config.json */
        title: {
            type: String,
            required: false,
            default: "additional:modules.controls.oblique.title"
        }
    },
    methods: {
        ...mapActions("Alerting", ["addSingleAlert"]),

        onClick () {
            const url = "https://geofos.fhhnet.stadt.hamburg.de/FHH-Schraegluftbilder/#/";

            this.addSingleAlert({
                category: "Info",
                content: this.$t("additional:modules.controls.oblique.messageRedirect"),
                confirmText: this.$t("additional:modules.controls.oblique.markAsRead"),
                mustBeConfirmed: true,
                once: true
            }).then((alertDisplayed) => {
                setTimeout(() => {
                    window.open(url, "_blank");
                }, alertDisplayed ? 5000 : 10);
            });
        }
    }
};
</script>

<template>
    <div id="oblique-control">
        <ControlIcon
            icon-name="picture"
            :title="$t(title)"
            :disabled="false"
            :on-click="onClick"
        />
    </div>
</template>

<style lang="scss" scoped>
</style>
