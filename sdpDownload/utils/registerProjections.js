import {registerProjections as _registerProjections} from "masterportalAPI/src/crs";
import * as Proj from "ol/proj.js";

/**
 *
 * @param {*} namedProjections namedProjections
 * @returns {void}
 */
export function registerProjections (namedProjections) {
    _registerProjections(namedProjections);

    Proj.addEquivalentProjections([Proj.get("EPSG:25832"),
        new Proj.Projection({code: "http://www.opengis.net/gml/srs/epsg.xml#25832", axis: "enu"})]);
}
