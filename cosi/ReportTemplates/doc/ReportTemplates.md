**ReportTemplates**

## What ReportTemplates does

ReportTemplates lets you retrieve the current settings of other addons, and later call those addons with the settings to receive some results. It functions as a single point of access to get results from different addons in a standardised way. 


## Usage


### retreive settings

To retrieve settings from different Addons, you need to import the `currentSettings` getter from `ReportTemplates`:
```
// import getter
mapGetters("Tools/ReportTemplates", ["currentSettings"])
```

Then you can call the getter like this:
```
// call getter
my_retreived_addon_settings = currentSettings("SomeAddonName");
// for example:
my_retreived_addon_settings = currentSettings("AccessibilityAnalyis");
```

### Run tool and retrieve results
```
this.$store.dispatch("Tools/ReportTemplates/runTool", {
                toolName: toolName,
                settings: settings,
                outputCallback: outputCallback
            });
```
- toolName: the name of the tool/addon you want to run as a character string
- settings: the settings you want to use for the tool, as retrieved from `currentSettings` (see above)
- outputCallback: a function defining what ReportTemplates should do with the other tool/addon's result once they are returned.

`this.$store.dispatch(...)` does not return the result. Instead, ReportTemplates calls whatever function you pass into `outputCallback` on the output.

So for example, this will log the outout to the console once the results are in:

```
this.$store.dispatch("Tools/ReportTemplates/runTool", {
                toolName: "AccessibilityAnalysis",
                settings: settings,
                outputCallback: console.log
            });

```

Or to send the results to a specific store variable:
```
this.$store.dispatch("Tools/ReportTemplates/runTool", {
                toolName: "AccessibilityAnalysis",
                settings: settings,
                outputCallback: (output) => { store.commit("Tools/SomeToolName/someVariable", output) }
            });

```


## Making new addons compatible with ReportTemplates

To make a new addon accessible through the ReportTemplates, add the following to that addon:

*A) add `ReportTemplatesIn` and `ReportTemplatesOut` to your addon's store STATE*

```
// you need to add two variables to the store state:
/*
* @property {object} ReportTemplatesIn: {settings: {}, type: "", outputCallback: ()=>{}} accepts settings from ReportTemplates (must have a *watcher*)
* @property {object} ReportTemplatesOut: {}  pass current settings to ReportTemplates (must have a *getter*)
*/
const state = {
    // ...
    // ...
    // these two variables are required to make this addon compatible with the ReportTemplates addon (for details see ReportTemplates documentation)
    ReportTemplatesIn: {settings: {}, type: "", outputCallback: null}, // accepts settings from ReportTemplates - must have a *watcher*
    ReportTemplatesOut: {},// pass current settings to ReportTemplates - must have a *getter*
};
```


*B) Add a GETTER for ReportTemplatesOut*

```
const getters = {
    // ...
    // ...
    // ...
    // this is required to make this addon compatible with the ReportTemplates addon (see ReportTemplates documentation).
    // the definition here must match the input expected by the watcher on the `ReportTemplatesIn` variable
    ReportTemplatesOut: (state) => {
        return {
            // something that matches what the ReportTemplatesIn watcher expects in 'settings'.
            // for example
            someVariable: state.someVariable
        };
    }
};
```

*C) Add a WATCHER for ReportTemplatesIn*

```
ReportTemplatesIn (newRequest) {
    /**
     * 1. update the interface based on the settings received from ReportTemplates
     * @param {Object} request the ReportTemplates request {id:..., settings:{...}}
     * @returns {Object} (run for side effects only, passes along the request)
     */
    const updateInterface = (request) => {
            // for example
            // this.someVariable = request.settings.someVariable
        },
        /**
        * 2. run the specific analysis of this addon
        * @returns {Object} the value of the function that runs the analysis. Depending on the addon, the function that triggers the analysis to run may or may not return the results; if not, we ignore this functions output, and pick the results from the state instead.
        */
        runTool = () => {
            // for example:
            // return this.runAnalysis();
        },
        /**
        * 3. hand the results back to ReportTemplates, in the form of: {request: ..., type: ..., result: ...}
        * @param {Object} request a ReportTemplates request in the form {settings:{...}, outputCallback:()=>()}
        * @returns {Object} null (runs for side effects only)
        */
        returnResults = () => {
            return this.$store.commit("Tools/ReportTemplates/setReceivedResults", // this is where ReportTemplates expects requested results to arrive
                {
                    result: this.analysisResults, // change to where results are stored
                    type: "geoJSON", // see ReportTemplates docs for supported output types
                    request: newRequest // we need to give back the original request as well, leave this as is.
                }
            );
        };

    // Now this runs the three steps, making sure they happen synchronously (so we don't try to return results before analysis is finished)
    updateInterface(newRequest);
    runTool().then(returnResults);
    return null; // we care about the side effects only.

}
```

