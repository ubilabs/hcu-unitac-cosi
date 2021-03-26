/**
 * User type definition
 * @typedef {Object} CommuterFlowsState
 * @property {Boolean} active if true, CommuterFlows will rendered
 * @property {String} name displayed as title (config-param)
 * @property {String} glyphicon icon next to title (config-param)
 * @property {Boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {Boolean} resizableWindow if true, window is resizable (config-param)
 * @property {Boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {Boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {String} metaVerPath the path to find more information about metaVer
 * @property {String[]} blacklistedDistricts districts (or cities) to not show in any case
 * @property {String} serviceURL the url to the commuter service (wfs)
 * @property {Number} listChunk the amount of features to receive for each show more/less call
 * @property {Boolean} setMarkerOnClickInList wheather or not the marker should be placed clicking in the feature list
 * @property {Object} onstart the initial settings for start or reset
 * @property {Boolean} onstart.captionsChecked wheather or not the captions are set on start or reset
 * @property {Boolean} onstart.numbersChecked wheather or not the numbers are set on start or reset
 * @property {Boolean} onstart.beamsChecked wheather or not the beams are set on start or reset
 * @property {Boolean} onstart.animationChecked wheather or not the animtaion is set on start or reset
 * @property {String} onstart.direction the start direction as String "out" or String "in"
 * @property {String} olFont the font to use for captions as ol/Text.font
 * @property {Object} olFontShadow the shadow for the captions as ol/Stroke options
 * @property {Object} olBeam the style for the lines (beams) as ol/Stroke options
 * @property {String} [olBubbleAlgorithm="area"] the algorithm to calculate the bubble sizes with ("area" or "radius")
 * @property {Number} olBubblePixelMax the maximum radius for bubbles in px
 * @property {Number} olBubblePixelMin the minimum radius for bubbles in px (does only apply for calcRadiusPxByRatio)
 * @property {Object} olBubbleBorder the style of the border of bubbles as ol/Stroke options
 * @property {Number[]} olBubbleColors the colors to use for the bubbles as list of rgby colors
 * @property {Number[]} olBubbleColorShift the highlight/lowlight shifting added to bubbleColors before repeating the colors
 * @property {Object} olZoomOptions the options for the zoom function given to the ol event for zooming
 * @property {Number[]} olAnimationPaces the pace for the animation: even idx for forwards speed in ms, odd idx for backwards speed in ms, leave a zero to jump forwards/backwards
 */
const state = {
    active: false,
    id: "CommuterFlows",
    name: "Pendlerströme",
    glyphicon: "glyphicon glyphicon-transfer",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    metaVerPath: "",
    blacklistedDistricts: [],
    serviceURL: "",
    listChunk: 0,
    setMarkerOnClickInList: false,
    onstart: {
        captionsChecked: false,
        numbersChecked: false,
        beamsChecked: false,
        animationChecked: false,
        direction: ""
    },
    olFont: "",
    olFontShadow: {},
    olBeam: {},
    olBubbleAlgorithm: "",
    olBubblePixelMax: 0,
    olBubblePixelMin: 0,
    olBubbleBorder: {},
    olBubbleColors: [],
    olBubbleColorShift: [],
    olZoomOptions: null,
    olAnimationPaces: []
};

export default state;
