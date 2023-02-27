/**
 * User type definition
 * @typedef {Object} ResidentialSimulationState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {Boolean} [deactivateGFI=true] - Deactivates the gfi if true (config-param).
 * @property {String} [icon="bi-house"] - Bootstrap icon class (config-param).
 * @property {String} id - The id of the district selector component.
 * @property {String} [name=Gebiet auswählen] - The name of the tool (config-param).
 * @property {Boolean} [renderToWindow=true] - Renders tool in a window if true, otherwise in the sidebar (config-param).
 * @property {Boolean} [resizableWindow=false] - If True, window is resizable (config-param).
 */
const state = {
    active: false,
    deactivateGFI: true,
    icon: "bi-house",
    id: "residentialSimulation",
    isVisibleInMenu: true,
    name: "$t('additional:modules.tools.cosi.residentialSimulation.createResidentialQuarters')",
    renderToWindow: false,
    resizableWindow: false,
    width: 0.45,
    // ResidentialSimulation specific state
    timelinePrefix: "$t('additional:modules.tools.cosi.residentialSimulation.timelinePrefix')",
    groupsList: [
        "$t('additional:modules.tools.cosi.residentialSimulation.population')",
        "$t('additional:modules.tools.cosi.residentialSimulation.populationPrognosis')",
        "$t('additional:modules.tools.cosi.residentialSimulation.unemployed')",
        "$t('additional:modules.tools.cosi.residentialSimulation.peopleWithSocialInsurance')",
        "$t('additional:modules.tools.cosi.residentialSimulation.SGB_II_benefits')",
        "$t('additional:modules.tools.cosi.residentialSimulation.traffic')"
    ],
    basePopulationProp: "$t('additional:modules.tools.cosi.residentialSimulation.populationTotal')",
    drawingLayer: null,
    defaults: {
        name: "$t('additional:modules.tools.cosi.residentialSimulation.myQuarter')",
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
            type: "BarChart"
        }
    ],
    readmeUrl: {
        "en-US": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/dev/cosi/manuals/residentialsimulation.md",
        "de-DE": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/dev/cosi/manuals/wohnquartiereanlegen.md"
    }
};

export default state;
