import tabVisitorTypesState from "./tab/visitor-types/state";
import tabCompareDatesState from "./tab/compare/dates/state";
import tabCompareLocationsState from "./tab/compare/locations/state";

const state = {
    id: "vpiDashboard",
    active: false,
    name: "translate#additional:modules.tools.vpiDashboard.title",
    icon: "bi-graph-up",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,
    chartData: "overview",
    allDataClicked: true,
    averageVisitorsPerMonth: [],
    averageVisitorsPerDay: [],
    individualVisitorsPerYear: "",
    allLocationsGeoJson: undefined,
    allLocationsArray: [],
    barChartDailyData: [],
    lineChartDailyData: [],
    barChartMonthlyData: [],
    lineChartMonthlyData: [],
    barChartData: {},
    lineChartData: {},
    showLoader: false,
    dwellTimesComplete: [],
    dwellTimesPerTime: {},
    dwellTimesPerDate: {},
    allAgeGroupsData: [],
    allAgeGroupsMonthlyData: [],
    allAgeGroupsMonthlyDataLine: [],
    ageGroupsYearlyData: [],
    ageGroupxLabels: [],
    allAgeGroupsYears: [],
    ageGroupPieChartLabels: ["20-29", "30-39", "40-49", "50-59", "60-69", ">69"],
    selectedLocationId: "",
    activityData: {},
    ...tabVisitorTypesState,
    ...tabCompareDatesState,
    ...tabCompareLocationsState
};

export default state;
