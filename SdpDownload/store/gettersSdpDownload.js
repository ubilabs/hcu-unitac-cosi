
import {generateSimpleGetters} from ".../../../src/app-store/utils/generators";
import sdpAddonState from "./stateSdpDownload";

const getters = {
    ...generateSimpleGetters(sdpAddonState)
};

export default getters;
