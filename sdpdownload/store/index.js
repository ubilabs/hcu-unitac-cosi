import getters from "./gettersSdpDownload";
import mutations from "./mutationsSdpDownload";
import state from "./stateSdpDownload";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
