/**
 * User type definition
 * @typedef {Object} TimeSeriesAnalyseState
 * @property {Boolean}  active - if true, component is rendered
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {String}   title - Module title
 */

export default {
    active: false,
    deactivateGFI: false,
    icon: "bi-clock-history",
    id: "timeSeriesAnalyse",
    name: "Time Series Analyse",
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: true,
    title: "Time Series Analyse",
    layerId: undefined,
    key: "Jahr",
    statisKey: undefined,
    yearRange: [],
    count: 10
};
