import {expect} from "chai";
import getters from "../../../store/gettersBoris";
import stateBoris from "../../../store/stateBoris";


describe("src/modules/tools/boris/store/gettersBoris.js", () => {

    afterEach(() => {
        // set state back, because of directly use of original state
        stateBoris.selectedPolygon = null;
        stateBoris.paramUrlParams = {};
    });

    describe("Boris getters", () => {
        it("findLanduseByBrwId", () => {
            stateBoris.selectedPolygon = {
                get: () => {
                    return [{
                        richtwertnummer: "rw1",
                        nutzungsart: "art1"
                    },
                    {
                        richtwertnummer: "rw2",
                        nutzungsart: "art2"
                    }];
                }
            };
            stateBoris.paramUrlParams.brwId = "rw1";
            expect(getters.findLanduseByBrwId()).to.equal("art1");

            // inka@vilma: hier wird ein möglicher Fehler aufgedeckt:
            // TypeError: Cannot read properties of undefined (reading 'nutzungsart') sieht man in der console
            // 1.) Vielleicht hast du selbst ein Idee wie man das lösen kann, sonst frage mich
            // 2.) was soll denn dieser getter zurückgeben, wenn foundLanduse nicht gefunden wird, einen Leerstring oder undefined (ist das in der Oberfläche sichtbar?)?
            // @inka: ist dass so richtig? --> siehe anpassungen gettersBoris.js: findLanduseByBrwId
            stateBoris.paramUrlParams.brwId = "nix";
            expect(getters.findLanduseByBrwId()).to.equal(undefined);
        });
    });
});
