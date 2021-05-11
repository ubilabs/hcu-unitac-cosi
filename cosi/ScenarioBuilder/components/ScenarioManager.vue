<script>
import {Select} from "ol/interaction";
import {singleClick} from "ol/events/condition";
import {mapGetters, mapActions, mapMutations} from "vuex";

export default {
    name: "ScenarioManager",
    props: {
        workingLayer: {
            type: Object,
            required: false,
            default: null
        }
    },
    data: () => ({
        //
    }),
    computed: {
        ...mapGetters("Map", ["map"])
    },
    methods: {
        listen () {

        },
        unlisten () {
            
        }
    }
}
</script>