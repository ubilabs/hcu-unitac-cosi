
import {generateSimpleGetters} from "../../../../src/app-store/utils/generators";
import vueAddonState from "./stateAccessibilityAnalysis";

const getters = {
    ...generateSimpleGetters(vueAddonState),
    // this is required to make this addon compatible with the toolBridge addon (see toolBridge documentation).
    // the definition here must match the input expected by the watcher on the `toolBridgeIn` variable
    toolBridgeOut: (state) => {
        return {
            mode: state.mode,
            coordinate: state.coordinate,
            selectedFacilityName: state.selectedFacilityName,
            selectedDirections: state.selectedDirections,
            transportType: state.transportType,
            scaleUnit: state.scaleUnit,
            distance: state.distance,
            time: state.timefi,
            useTravelTimeIndex: state.useTravelTimeIndex,
            setByFeature: state.setByFeature,
            steps: state.steps
        };
    }
};

export default getters;
