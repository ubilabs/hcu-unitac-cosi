import {renameKeys, replaceValues} from "../../utils/modifyObject.js";
// import beautifyKey from "../../../../src/utils/beautifyKey";

const
    keyMap = {
        category: "Kategorie",
        group: "Gruppe",
        valueType: "Datentyp",
        timestamp: "Jahr",
        hamburg_gesamt: "Hamburg gesamt"
    },
    valuesMap = {
        absolute: "absolut",
        relative: "relativ"
    };

/**
 * Prepares the table data for an XLSX export, just the table as displayed
 * @param {Object[]} data - the feature data from the featuresList
 * @param {Number} timestamp - timestamp
 * @param {String} timestampPrefix - timestamp prefix
 * @returns {Object[]} data for export
 */
export function prepareTableExport (data, timestamp, timestampPrefix = "jahr_") {
    if (data.constructor !== Array) {
        console.error("prepareTableExport: data must be an array");
        return null;
    }
    const exportData = data.map(item => {
        const _item = renameKeys(item, keyMap);

        for (const col in _item) {
            if (typeof _item[col] === "object") {
                const val = parseFloat(_item[col][timestampPrefix + timestamp]);

                _item[col] = !isNaN(val) ? val : _item[col][timestampPrefix + timestamp];
            }
        }

        _item[keyMap.timestamp] = timestamp;

        return _item;
    });

    return exportData;
}

/**
 * Prepares the table data for an XLSX export, just the table as displayed
 * @param {Object[]} data - the feature data from the featuresList
 * @param {Number[]} timestamps - timestamps
 * @param {String} timestampPrefix - timestamp prefix
 * @returns {Object[]} data for export
 */
export function prepareTableExportWithTimeline (data, timestamps, timestampPrefix) {
    if (data.constructor !== Array) {
        console.error("prepareTableExport: data must be an array");
        return null;
    }
    const
        // _keyMap = {...Object.fromEntries(Object.keys(data[0] || {}).map(key => [key, beautifyKey(key)])), ...keyMap},
        ctimestamps = timestamps.slice().reverse(),
        exportData = data.reduce((items, item) => {
            const _item = replaceValues(renameKeys(item, keyMap), valuesMap),
                categoryRows = ctimestamps.map(timestamp => {
                    const el = {..._item};

                    for (const col in el) {
                        if (typeof _item[col] === "object") {
                            const val = parseFloat(el[col][timestampPrefix + timestamp]);

                            el[col] = !isNaN(val) ? val : "-";
                        }
                    }

                    el[keyMap.timestamp] = timestamp;

                    return el;
                });

            return [...items, ...categoryRows];
        }, []);

    return exportData;
}
