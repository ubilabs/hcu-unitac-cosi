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
    name: "translate#additional:modules.tools.cosi.residentialSimulation.title",
    renderToWindow: false,
    resizableWindow: false,
    width: 0.45,
    // ResidentialSimulation specific state
    timelinePrefix: "jahr_",
    groupsList: ["Bevölkerung", "Bevölkerung Prognose", "Arbeitslose", "Sozialversicherungspflichtige", "SGB II Leistungen", "Verkehr"],
    basePopulationProp: "Bevölkerung insgesamt",
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
            name: "additional:modules.tools.cosi.residentialSimulation.visualizeDemographicsByGender",
            scaleLabels: ["additional:modules.tools.cosi.residentialSimulation.rate", "additional:modules.tools.cosi.residentialSimulation.gender"],
            labels: [
                "additional:modules.tools.cosi.residentialSimulation.populationFemale",
                "additional:modules.tools.cosi.residentialSimulation.populationMale",
                "additional:modules.tools.cosi.residentialSimulation.peopleWithSocialInsuranceTotal",
                "additional:modules.tools.cosi.residentialSimulation.peopleWithSocialInsuranceFemale",
                "additional:modules.tools.cosi.residentialSimulation.peopleWithSocialInsuranceMale"
            ],
            type: "BarChart"
        },
        {
            id: "age",
            name: "additional:modules.tools.cosi.residentialSimulation.visualizeDemographicsByAge",
            scaleLabels: ["additional:modules.tools.cosi.residentialSimulation.rate", "additional:modules.tools.cosi.residentialSimulation.ageCohort"],
            labels: [
                "additional:modules.tools.cosi.residentialSimulation.populationBelow6",
                "additional:modules.tools.cosi.residentialSimulation.population6to10",
                "additional:modules.tools.cosi.residentialSimulation.population10to15",
                "additional:modules.tools.cosi.residentialSimulation.population15to21",
                "additional:modules.tools.cosi.residentialSimulation.population21to45",
                "additional:modules.tools.cosi.residentialSimulation.population45to65",
                "additional:modules.tools.cosi.residentialSimulation.populationAbove65"
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
