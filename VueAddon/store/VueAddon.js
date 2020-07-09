import GenericTool from "../../../src/modules/tools/indexTools";
import composeModules from "../../../src/app-store/utils/composeModules";
import getters from "./gettersVueAddon";
import mutations from "./mutationsVueAddon";
import actions from "./actionsVueAddon";
import state from "./stateVueAddon";

export default composeModules([GenericTool, {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}]);
