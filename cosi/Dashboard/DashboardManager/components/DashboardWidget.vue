<script>
import Tool from "../../../../../src/modules/tools/Tool.vue";

export default {
    name: "DashboardWidget",
    extends: Tool,
    /**
     * @description remove watcher from Tool Component
     * @returns {void}
    */
    created () {
        this._watchers.find(watcher => watcher.expression === "active").teardown();
    }
};

</script>
