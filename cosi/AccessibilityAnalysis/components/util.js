import GeoJSON from "ol/format/GeoJSON";

export function readFeatures (data) {
    return new GeoJSON().readFeatures(data);
}

export function writeFeatures (data) {
    return new GeoJSON().writeFeatures(data);
}
