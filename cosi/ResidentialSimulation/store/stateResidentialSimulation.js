/**
 * User type definition
 * @typedef {Object} ResidentialSimulationState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {Boolean} [deactivateGFI=true] - Deactivates the gfi if true (config-param).
 * @property {String} [glyphicon="glyphicon-home"] - Bootstrap glyphicon class (config-param).
 * @property {String} id - The id of the district selector component.
 * @property {String} [name=Gebiet auswählen] - The name of the tool (config-param).
 * @property {Boolean} [renderToWindow=true] - Renders tool in a window if true, otherwise in the sidebar (config-param).
 * @property {Boolean} [resizableWindow=false] - If True, window is resizable (config-param).
 */
const state = {
    active: false,
    deactivateGFI: true,
    glyphicon: "glyphicon-home",
    id: "residentialSimulation",
    isVisibleInMenu: true,
    name: "Wohnungsbauquartiere anlegen",
    renderToWindow: false,
    resizableWindow: false,
    width: 0.45,
    // ResidentialSimulation specific state
    timelinePrefix: "jahr_",
    groupsList: ["Bevölkerung", "Arbeitslose", "Sozialversicherungspflichtige", "SGB II Leistungen", "Verkehr"],
    drawingLayer: null,
    defaults: {
        name: "Mein Wohnquartier",
        avgHouseholdSize: 2.5,
        gfz: 1.0,
        populationDensity: 5000,
        livingSpace: 30
    },
    referenceDistrictCharts: [
        {
            id: "gender",
            name: "Demographie nach Gender",
            scaleLabels: ["Anteil", "Gender"],
            labels: [
                "Bevölkerung weiblich",
                "Bevölkerung männlich",
                "Sozialversicherungspflichtig Beschäftigte insgesamt",
                "Sozialversicherungspflichtig beschäftigte Frauen",
                "Sozialversicherungspflichtig beschäftigte Männer"
            ],
            type: "BarChart"
        },
        {
            id: "age",
            name: "Demographie nach Altersgruppen",
            scaleLabels: ["Anteil", "Alterskohorten"],
            labels: [
                "Bevölkerung unter 6 Jahren",
                "Bevölkerung 6 bis unter 10 Jahren",
                "Bevölkerung 10 bis unter 15 Jahren",
                "Bevölkerung 15 bis unter 21 Jahren",
                "Bevölkerung 21 bis unter 45 Jahren",
                "Bevölkerung 45 bis unter 65 Jahren",
                "Bevölkerung ab 65 Jahren"
            ],
            type: "LineChart"
        }
    ]
};

export default state;
