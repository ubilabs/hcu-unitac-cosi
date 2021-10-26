import axios from "axios";
import TileWMS from "ol/source/TileWMS.js";
import TileGrid from "ol/tilegrid/TileGrid.js";

/**
 *
 * @param {*} url url
 * @param {*} layer layer
 * @return {*}  TileWMs
 */
function createTileWMS (url, layer) {
    return new TileWMS({
        url,
        gutter: 0,
        params: {"LAYERS": layer, "FORMAT": "image/png", "VERSION": "1.3.0"},
        tileGrid: new TileGrid({
            resolutions: [0.1],
            origin: [
                0,
                0
            ],
            tileSize: 512
        })
    });
}

/**
 *
 * @param {*} source source
 * @param {*} coord coordinate
 * @param {*} projection projection
 * @return {*} url
 */
function getFeatureInfoUrl (source, coord, projection) {
    return source.getFeatureInfoUrl(coord, null, projection, {"INFO_FORMAT": "text/xml"});
}

/**
 *
 * @param {*} wmsUrl wmsUrl
 * @param {*} layer layer
 * @param {*} coord coord
 * @param {*} projection projection
 * @return {*} feature info
 */
export async function getFeatureInfo (wmsUrl, layer, coord, projection) {
    const source = createTileWMS(wmsUrl, layer),
        url = getFeatureInfoUrl(source, coord, projection),
        ret = await axios.get(url);

    return ret.data;
}
