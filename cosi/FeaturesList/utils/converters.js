/**
 * @class RegexConverter
 */
export class RegexConverter {
    /**
     * Creates an instance of RegexConverter.
     * @param {*} regexp regexp
     * @param {*} extractor extractor
     * @memberof RegexConverter
     */
    constructor (regexp, extractor) {
        this.regexp = new RegExp(regexp);
        this.extractor = extractor;
    }

    /**
     * @param {*} str string
     * @return {*} value
     */
    convert (str) {
        const m = this.regexp.exec(str);

        if (m === null) {
            return null;
        }

        return this.extractor(m);
    }
}

/**
 * @class DbRangeConverter
 */
export class DbRangeConverter {
    /**
     * Creates an instance of RegexConverter.
     * @param {*} regexp regexp
     * @param {*} extractor extractor
     * @memberof RegexConverter
     */
    constructor () {
        this.converter = new RegexConverter("> (\\d+) - (\\d+) dB\\(A\\)", m => (parseFloat(m[1]) + parseFloat(m[2])) / 2);
    }

    /**
     * @param {*} str string
     * @return {*} value
     */
    convert (str) {
        return this.converter.convert(str);
    }
}
