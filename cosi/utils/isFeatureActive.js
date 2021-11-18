// import store from "../../../src/app-store";

// /**
//  * Uses the store getter on the featuresList to test whether a feature has been disabled
//  * @param {*} feature - the feature to test
//  * @returns {Boolean} true/false
//  */
// function isFeatureDisabled (feature) {
//     // eslint-disable-next-line new-cap
//     return store.getters["Tools/FeaturesList/isFeatureDisabled"](feature);
// }

// /**
//  * Tests whether a feature is active and visible in the map
//  * @param {module:ol/Feature} feature - the feature to test
//  * @returns {Boolean} true/false
//  */
// export default function isFeatureActive (feature) {
//     return (typeof feature.style_ === "object" || feature.style_ === null) && !isFeatureDisabled(feature);
// }
