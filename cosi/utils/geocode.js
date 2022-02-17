import {fetchRoutingNominatimGeosearchReverse} from "../../../src/modules/tools/routing/utils/geosearch/routing-nominatim-geosearch";
import {fetchRoutingBkgGeosearchReverse} from "../../../src/modules/tools/routing/utils/geosearch/routing-bkg-geosearch";
import * as Proj from "ol/proj.js";

/**
 * @param {Array<Number>} coords - the point coordinates
 * @param {String} portalCrs - the portal's CRS
 * @param {"NOMINATIM" | "BKG"} [type="NOMINATIM"] - which geocoder to use
 * @return {String} the address from gazetter
 */
export function reverseGeocode (coords, portalCrs, type = "NOMINATIM") {
    const _coords = Proj.transform(coords, portalCrs, "EPSG:4326");

    return type === "BKG" ? fetchRoutingBkgGeosearchReverse(_coords) : fetchRoutingNominatimGeosearchReverse(_coords);
}

/**
 * returns the address name for a geometry
 * @param {module:ol/Geometry} geom - the geometry
 * @param {String} portalCrs - the portal's CRS
 * @param {"NOMINATIM" | "BKG"} [type="NOMINATIM"] - which geocoder to use
 * @return {String} the address
 */
export async function getAddress (geom, portalCrs, type) {
    console.log(type);
    const
        coordinates = geom.getType() === "Polygon" || geom.getType() === "MultiPolygon" ?
            geom.getExtent().getCenter() :
            geom.getCoordinates(),
        geocode = await reverseGeocode(coordinates, portalCrs, type);

    return geocode?.displayName;
}
