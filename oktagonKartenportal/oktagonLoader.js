import OktagonURLParameter from "./oktagonURLParameter";
import OktagonGetFeatureInformationView from "./oktagonGFIView";

/**
 * Loads the model to parse the url parameter and the oktagon view model
 * @returns {void}
 */
function initializeOktagonKartenportal () {
    new OktagonURLParameter();
    new OktagonGetFeatureInformationView();
}

export default initializeOktagonKartenportal;
