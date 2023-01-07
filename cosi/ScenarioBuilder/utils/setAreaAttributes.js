/**
 * set additional attributes based on geometry
 * @param {module:ol/Feature} feature -the feature
 * @param {{key: string, factorToSqm: number}[]} areaAttributes -the area related attributes to set
 * @returns {void}
 */
export default function setAreaAttributes (feature, areaAttributes) {
    const geometry = feature.getGeometry();

    if (geometry?.getType() === "Polygon" || geometry?.getType() === "MultiPolygon") {
        const area = Math.round((geometry.getArea() + Number.EPSILON) * 100) / 100;

        for (const attr of areaAttributes) {
            feature.set(attr.key, area * attr.factorToSqm);
        }
    }
}
