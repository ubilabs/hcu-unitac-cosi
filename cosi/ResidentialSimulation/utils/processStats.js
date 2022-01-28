import {getLastAvailableYear} from "../../utils/getAvailableYears";
import MappingJson from "../../assets/mapping.json";

/**
 * @todo ONLY PROTOTYPE!!!! refactor
 * @param {String} districtName -
 * @param {String} districtLevel -
 * @param {module:ol/Feature[]} statsFeatures -
 * @param {String} basePopulationProp -
 * @param {String} timelinePrefix -
 * @param {String} groupsList -
 * @returns {Object} - the base stats for the picked reference district
 */
export default function processStats (districtName, districtLevel, statsFeatures, basePopulationProp, timelinePrefix, groupsList) {
    const stats = statsFeatures.map(feature => feature.getProperties()),
        latestYear = timelinePrefix + getLastAvailableYear(statsFeatures, timelinePrefix),
        populationStats = groupsList.length > 0 ? MappingJson.filter(mappingObj => groupsList.includes(mappingObj.group)) : MappingJson,
        basePopulationFeature = statsFeatures.find(feature => feature.get("kategorie") === basePopulationProp),
        basePopulation = parseFloat(basePopulationFeature.get(latestYear)),
        baseStats = {
            reference: {
                districtName,
                districtLevel
            },
            absolute: [],
            relative: []
        };

    for (const mappingObj of populationStats) {
        const datum = stats.find(d => d.kategorie === mappingObj.value);
        let value;

        if (mappingObj.valueType === "absolute") {
            value = parseFloat(datum[latestYear]) / basePopulation;
        }
        else {
            value = parseFloat(datum[latestYear]);
        }

        baseStats[mappingObj.valueType].push({
            group: datum.group,
            category: datum.kategorie,
            value: value,
            valueType: mappingObj.valueType
        });
    }

    return baseStats;
}
