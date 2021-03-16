<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersDistrictLoader";
import mutations from "../store/mutationsDistrictLoader";
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
        }
    },
    created () {
        modifyDistricts(this.districtLevels);
        this.setSelectedDistrictLevel(this.districtLevels[0]);
    },

    methods: {
        ...mapMutations("Tools/DistrictLoader", Object.keys(mutations))
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
