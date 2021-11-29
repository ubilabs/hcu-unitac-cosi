/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateArea (newArea, neighborhood, fallbacks) {
    const area = newArea,
        livingSpace = neighborhood.livingSpace,
        householdSize = neighborhood.avgHouseholdSize,
        gfz = neighborhood.gfz,
        bgf = area * gfz,
        residents = bgf / (livingSpace * 1.25),
        populationDensity = residents * 1000000 / area,
        units = residents / householdSize;

    neighborhood.residents = residents;
    neighborhood.populationDensity = populationDensity;
    neighborhood.bgf = bgf;
    neighborhood.housingUnits = units;

    fallbacks.residents = residents;
    fallbacks.populationDensity = populationDensity;
    fallbacks.bgf = bgf;
    fallbacks.housingUnits = units;
}

/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateUnits (newUnits, neighborhood, fallbacks, polygonArea) {
    if (polygonArea === 0) {
        return;
    }
    const area = neighborhood.area,
        livingSpace = neighborhood.livingSpace,
        householdSize = neighborhood.avgHouseholdSize,
        units = newUnits,
        residents = units * householdSize,
        populationDensity = residents * 1000000 / area,
        bgf = residents * livingSpace * 1.25,
        gfz = bgf / area;

    if (!validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
        neighborhood.housingUnits = fallbacks.housingUnits;
    }
    else {
        neighborhood.residents = residents;
        neighborhood.populationDensity = populationDensity;
        neighborhood.bgf = bgf;
        neighborhood.gfz = gfz;

        fallbacks.housingUnits = units;
        fallbacks.residents = residents;
        fallbacks.populationDensity = populationDensity;
        fallbacks.bgf = bgf;
        fallbacks.gfz = gfz;
    }
}

/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateResidents (newResidents, neighborhood, fallbacks, polygonArea) {
    if (polygonArea === 0) {
        return;
    }
    const area = neighborhood.area,
        livingSpace = neighborhood.livingSpace,
        householdSize = neighborhood.avgHouseholdSize,
        residents = newResidents,
        units = newResidents / householdSize,
        populationDensity = residents * 1000000 / area,
        bgf = residents * livingSpace * 1.25,
        gfz = bgf / area;

    if (!validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
        neighborhood.residents = fallbacks.residents;
    }
    else {
        neighborhood.housingUnits = units;
        neighborhood.populationDensity = populationDensity;
        neighborhood.bgf = bgf;
        neighborhood.gfz = gfz;

        fallbacks.residents = residents;
        fallbacks.housingUnits = units;
        fallbacks.populationDensity = populationDensity;
        fallbacks.bgf = bgf;
        fallbacks.gfz = gfz;
    }
}

/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateDensity (newDensity, neighborhood, fallbacks, polygonArea) {
    if (polygonArea === 0) {
        return;
    }
    const area = neighborhood.area,
        livingSpace = neighborhood.livingSpace,
        householdSize = neighborhood.avgHouseholdSize,
        populationDensity = newDensity,
        residents = (newDensity * area) / 1000000,
        units = residents / householdSize,
        bgf = residents * livingSpace * 1.25,
        gfz = bgf / area;

    if (!validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
        neighborhood.populationDensity = fallbacks.populationDensity;
    }
    else {
        neighborhood.housingUnits = units;
        neighborhood.residents = residents;
        neighborhood.bgf = bgf;
        neighborhood.gfz = gfz;

        fallbacks.populationDensity = populationDensity;
        fallbacks.housingUnits = units;
        fallbacks.residents = residents;
        fallbacks.bgf = bgf;
        fallbacks.gfz = gfz;
    }
}

/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateLivingSpace (newLivingSpace, neighborhood, fallbacks, polygonArea) {
    if (polygonArea === 0) {
        return;
    }
    const area = neighborhood.area,
        householdSize = neighborhood.avgHouseholdSize,
        gfz = neighborhood.gfz,
        bgf = gfz * area,
        livingSpace = newLivingSpace,
        residents = bgf / (livingSpace * 1.25),
        populationDensity = residents * 1000000 / area,
        units = residents / householdSize;

    if (!validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
        neighborhood.livingSpace = fallbacks.livingSpace;
    }
    else {
        neighborhood.housingUnits = units;
        neighborhood.residents = residents;
        neighborhood.populationDensity = populationDensity;
        neighborhood.bgf = bgf;

        fallbacks.livingSpace = livingSpace;
        fallbacks.housingUnits = units;
        fallbacks.residents = residents;
        fallbacks.populationDensity = populationDensity;
        fallbacks.bgf = bgf;
    }
}

/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateGfz (newGfz, neighborhood, fallbacks, polygonArea) {
    if (polygonArea === 0) {
        return;
    }
    const area = neighborhood.area,
        householdSize = neighborhood.avgHouseholdSize,
        livingSpace = neighborhood.livingSpace,
        gfz = newGfz,
        bgf = gfz * area,
        residents = bgf / (livingSpace * 1.25),
        populationDensity = residents * 1000000 / area,
        units = residents / householdSize;

    if (!validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
        neighborhood.gfz = fallbacks.gfz;
    }
    else {
        neighborhood.housingUnits = units;
        neighborhood.residents = residents;
        neighborhood.populationDensity = populationDensity;
        neighborhood.bgf = bgf;

        fallbacks.gfz = gfz;
        fallbacks.housingUnits = units;
        fallbacks.residents = residents;
        fallbacks.populationDensity = populationDensity;
        fallbacks.bgf = bgf;
    }
}

/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateBgf (newBgf, neighborhood, fallbacks, polygonArea) {
    if (polygonArea === 0) {
        return;
    }
    const area = neighborhood.area,
        householdSize = neighborhood.avgHouseholdSize,
        livingSpace = neighborhood.livingSpace,
        bgf = newBgf,
        gfz = bgf / area,
        residents = bgf / (livingSpace * 1.25),
        populationDensity = residents * 1000000 / area,
        units = residents / householdSize;

    if (!validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
        neighborhood.bgf = fallbacks.bgf;
    }
    else {
        neighborhood.housingUnits = units;
        neighborhood.residents = residents;
        neighborhood.populationDensity = populationDensity;
        neighborhood.gfz = gfz;

        fallbacks.bgf = bgf;
        fallbacks.housingUnits = units;
        fallbacks.residents = residents;
        fallbacks.populationDensity = populationDensity;
        fallbacks.gfz = gfz;
    }
}

/**
 * 
 * @param {*} newHouseholdSize 
 * @returns {*}
 */
export function updateHousholdSize (newHouseholdSize, neighborhood, fallbacks, polygonArea) {
    if (polygonArea === 0) {
        return;
    }
    const area = neighborhood.area,
        livingSpace = neighborhood.livingSpace,
        residents = neighborhood.residents,
        gfz = neighborhood.gfz,
        bgf = gfz * area,
        householdSize = newHouseholdSize,
        populationDensity = residents * 1000000 / area,
        units = residents / householdSize;

    if (!validateValues(householdSize, populationDensity, gfz, bgf, livingSpace, area)) {
        neighborhood.avgHouseholdSize = fallbacks.avgHouseholdSize;
    }
    else {
        neighborhood.housingUnits = units;
        neighborhood.populationDensity = populationDensity;
        neighborhood.bgf = bgf;

        fallbacks.avgHouseholdSize = householdSize;
        fallbacks.housingUnits = units;
        fallbacks.populationDensity = populationDensity;
        fallbacks.bgf = bgf;
    }
}

/**
 * 
 * @param {*} householdSize 
 * @param {*} populationDensity 
 * @param {*} gfz 
 * @param {*} bgf 
 * @param {*} livingSpace 
 * @param {*} area 
 * @param {*} lowerBounds 
 * @param {*} upperBounds 
 * @returns {Boolean} - whether the data entered is permissable
 */
export function validateValues (householdSize, populationDensity, gfz, bgf, livingSpace, area,
    lowerBounds = {householdSize: 1.0, populationDensity: 0, gfz: 0, livingSpace: 10},
    upperBounds = {householdSize: 6.0, populationDensity: 50000, gfz: 4.0, livingSpace: 100}
) {
    const validHouseholdSize = householdSize >= lowerBounds.householdSize && householdSize <= upperBounds.householdSize,
        validPopulationDensity = populationDensity >= lowerBounds.populationDensity && populationDensity <= upperBounds.populationDensity,
        validGfz = gfz >= lowerBounds.gfz && gfz <= upperBounds.gfz,
        validBgf = bgf >= lowerBounds.gfz * area && bgf <= upperBounds.gfz * area,
        validLivingSpace = livingSpace >= lowerBounds.livingSpace && livingSpace <= upperBounds.livingSpace;

    return (
        validHouseholdSize &&
        validPopulationDensity &&
        validGfz &&
        validBgf &&
        validLivingSpace
    );

}