import typesMapping from "../../assets/mapping.types.json";

const rules = {
    required: [
        value => Boolean(value) || "Erforderlich"
    ],
    number: [
        value => !isNaN(parseFloat(value)) || "Wert muss eine Zahl sein. Kommastellen müssen mit Punkt abgetrennt werden"
    ],
    string: [],
    date: [],
    geom: []
};

/**
 * Returns the validation rules for the given data type
 * @param {String} field the field description
 * @returns {Function[]} the rule set for the data type
 */
export default function validateProp (field) {
    const baseRule = field.minOccurs > 0 ? [rules.required] : [],
        type = typesMapping[field.type] || [];

    return [...baseRule, ...rules[type]];
}
