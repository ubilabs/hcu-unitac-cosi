import {fetchRoutingNominatimGeosearchReverse} from "../../../src/modules/tools/routing/utils/geosearch/routing-nominatim-geosearch";
import * as Proj from "ol/proj.js";

/**
 * @param {Array<Number>} coords - the point coordinates
 * @param {String} portalCrs - the portal's CRS
 * @return {String} the address from gazetter
 */
export function reverseGeocode (coords, portalCrs) {
    const _coords = Proj.transform(coords, portalCrs, "EPSG:4326");

    return fetchRoutingNominatimGeosearchReverse(_coords);
}

/**
 * returns the address name for a geometry
 * @param {module:ol/Geometry} geom - the geometry
 * @param {String} portalCrs - the portal's CRS
 * @return {String} the address
 */
export async function getAddress (geom, portalCrs) {
    const
        coordinates = geom.getType() === "Polygon" || geom.getType() === "MultiPolygon" ?
            geom.getExtent().getCenter() :
            geom.getCoordinates(),
        geocode = await reverseGeocode(coordinates, portalCrs);

    return geocode?.displayName;
}
