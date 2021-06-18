<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersDistrictLoader";
import mutations from "../store/mutationsDistrictLoader";
import actions from "../store/actionsDistrictLoader";
import modifyDistricts from "../utils/modifyDistricts.js";

export default {
    name: "DistrictLoader",
    computed: {
        ...mapGetters("Tools/DistrictLoader", Object.keys(getters)),
        ...mapGetters("Tools/DistrictSelector", ["label"])
    },

    watch: {
        label (newLabel) {
            this.setSelectedDistrictLevel(this.districtLevels.find(districtLevel => {
                return districtLevel.label === newLabel;
            }));
        },
        /**
         * Update the district features on the map by the loaded stats for the currently selected level
         * Triggers whenever the selected level changes or new features are added/removed.
         */
        selectedDistrictLevel: {
            deep: true,
            handler () {
                if (this.currentStatsFeatures?.length > 0) {
                    this.appendStatsToDistricts({statsFeatures: this.currentStatsFeatures});
                }
            }
        }
    },
    created () {
        modifyDistricts(this.districtLevels);
        this.setSelectedDistrictLevel(this.districtLevels[0]);
    },

    methods: {
        ...mapMutations("Tools/DistrictLoader", Object.keys(mutations)),
        ...mapActions("Tools/DistrictLoader", Object.keys(actions))
    },
    /**
     * @description override render function for Renderless Component
     * @returns {void}
     */
    render () {
        return null;
    }
};
</script>
