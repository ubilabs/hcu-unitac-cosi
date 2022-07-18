import {expect} from "chai";
import state from "../../../store/stateRefugeeHomes";
import sinon from "sinon";
import actions from "../../../store/actionsRefugeeHomes";
import Vuex from "vuex";
import {createLocalVue} from "@vue/test-utils";

describe("ADDONS: addons/refugeeHomes/store/mutationsRefugeeHomes", () => {

    let store, commit, dispatch, rootGetters, getters, rootState;

    const testFeature = {bezirk: "Altona", bezeichnung: "123", strasse: "musterstr", stadtteil: "5", platzzahl: 130},
        localVue = createLocalVue();

    localVue.use(Vuex);

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            state: {
                features: [],
                filteredFeatures: [],
                layerIds: ["4553"]
            }
        });
        dispatch = sinon.spy();
    });

    it("RequestRawLayerList dispatch buildAndGetRequestUrl and sendRequest ", async function () {

        await actions.requestRawLayerList({getters: {layerIds: ["4553"]}, dispatch});
        expect(dispatch.calledTwice).to.be.true;

        expect(dispatch.args[0][0]).to.equal("buildAndGetRequestUrl");
        expect(dispatch.args[0][1]).to.deep.equal(null);
        expect(dispatch.args[1][0]).to.equal("sendRequest");
    });
    it("buildAndGetRequestUrl results in string url", async function () {
        const rawLayer = {url: "https://testurl", featureType: "testFeatureTyp"},
            buildAndGetRequestUrl = await actions.buildAndGetRequestUrl(state, rawLayer);

        expect(buildAndGetRequestUrl).to.be.a("string");
        expect(buildAndGetRequestUrl).to.equal("https://testurl?service=WFS&request=GetFeature&version=2.0.0&typeNames=testFeatureTyp");
    });
    it.skip("parseFeatures parses xml", function () {
        const data = "<?xml version='1.0' encoding='UTF-8'?><wfs:FeatureCollection xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd http://www.deegree.org/app https://geodienste.hamburg.de/HH_WFS_Fluechtlinge_OERU?SERVICE=WFS&amp;VERSION=2.0.0&amp;REQUEST=DescribeFeatureType&amp;OUTPUTFORMAT=application%2Fgml%2Bxml%3B+version%3D3.2&amp;TYPENAME=app:oeru_bestehend&amp;NAMESPACES=xmlns(app,http%3A%2F%2Fwww.deegree.org%2Fapp)\" xmlns:wfs=\"http://www.opengis.net/wfs/2.0\" timeStamp=\"2022-07-04T14:28:05Z\" xmlns:gml=\"http://www.opengis.net/gml/3.2\" numberMatched=\"unknown\" numberReturned=\"0\"><!--NOTE: numberReturned attribute should be 'unknown' as well, but this would not validate against the current version of the WFS 2.0 schema (change upcoming). See change request (CR 144): https://portal.opengeospatial.org/files?artifact_id=43925.--><wfs:member><app:oeru_bestehend xmlns:app=\"http://www.deegree.org/app\" gml:id=\"APP_OERU_BESTEHEND_1644\"><app:bezeichnung>Albert-Einstein-Ring 1-3a (örU)</app:bezeichnung><app:strasse>Albert-Einstein-Ring  3a</app:strasse><app:bezirk>Altona</app:bezirk><app:stadtteil>7</app:stadtteil><app:platzzahl>350</app:platzzahl><app:platzzahl_hinweis>Bei den Platzzahlen handelt es sich um die Normalkapazität. Der tatsächliche Belegungsstand kann abweichen, z.B. aufgrund noch durchzuführender baulicher Maßnahmen.</app:platzzahl_hinweis><app:inbetriebnahme>2017</app:inbetriebnahme><app:geom><gml:Point gml:id=\"APP_OERU_BESTEHEND_1644_APP_GEOM\" srsName=\"EPSG:25832\"><gml:pos>559002.029 5936500.529</gml:pos></gml:Point></app:geom></app:oeru_bestehend></wfs:member></wfs:FeatureCollection>";

        actions.parseFeatures({getters, dispatch, commit, rootGetters}, data);

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.args[0][0]).to.equal("scaleImages");
        expect(commit.calledOnce).to.be.true;
        expect(commit.args[0][0]).to.equal("addFeature");
    });
    it("Scaleimages provides the adapted image size value", async function () {
        const updatedFeature = await actions.scaleImages({}, {platzzahl: 50});

        expect(updatedFeature.imgHeight).to.equal(20);
    });
    it("sendRequest should execute axios get and throw an alert", () => {
        actions.sendRequest({dispatch}, "www.no_value.de");
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.args[0][0]).to.equal("Alerting/addSingleAlert");

    });
});
