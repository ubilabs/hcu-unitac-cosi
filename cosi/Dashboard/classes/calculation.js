/**
 * @description Simple struct
 * @class Calculation
 */
export default class Calculation {
    /**
     * Constructor for the class
     * @param {"add" | "subtract" | "multiply" | "divide" | "sumUpSelected" | "divideSelected"} operation - math operation
     * @param {{category_A: String, category_B: String, selectedCategories: String[], modifier: Number}} [options={}] - options
     */
    constructor (operation, options = {}) {
        this.operation = operation;
        this.category_A = options.category_A;
        this.category_B = options.category_B;
        this.selectedCategories = options.selectedCategories;
        this.modifier = options.modifier || 1;
    }
}
