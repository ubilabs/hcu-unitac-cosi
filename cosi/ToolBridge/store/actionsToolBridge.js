export default {
    runTool ({commit, getters}, {toolName, settings, outputCallback}) {
        // here we only check if the requested tool is supported, then pass the request to the tool's store.
        // the requested tool itself should have a watcher that does the rest (run the analysis based on the settings and commits the results back to the toolBridge' store shelf.)
        // validate inputs
        if (!getters.supportedTools.includes(toolName)) {
            throw new Error(toolName + " not supported");
        }
        if (typeof outputCallback !== "function") {
            throw new Error(outputCallback + " must be a function");
        }
        // commit request to the requested tool
        const toolPath = "Tools/" + toolName + "/setToolBridgeIn";

        commit(
            toolPath,
            {
                settings: settings,
                outputCallback: outputCallback
            },
            {root: true} // allows commit to a different module
        );
    }
};
