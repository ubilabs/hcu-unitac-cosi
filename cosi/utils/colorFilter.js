/**
 *
 */
export class Color {
    /** */
    constructor (r, g, b) {
        this.set(r, g, b);
    }

    /** */
    toString () {
        return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
    }

    /** */
    set (r, g, b) {
        this.r = this.clamp(r);
        this.g = this.clamp(g);
        this.b = this.clamp(b);
    }

    /** */
    hueRotate (angle = 0) {
        angle = angle / 180 * Math.PI;
        const sin = Math.sin(angle),
            cos = Math.cos(angle);

        this.multiply([
            0.213 + cos * 0.787 - sin * 0.213,
            0.715 - cos * 0.715 - sin * 0.715,
            0.072 - cos * 0.072 + sin * 0.928,
            0.213 - cos * 0.213 + sin * 0.143,
            0.715 + cos * 0.285 + sin * 0.140,
            0.072 - cos * 0.072 - sin * 0.283,
            0.213 - cos * 0.213 - sin * 0.787,
            0.715 - cos * 0.715 + sin * 0.715,
            0.072 + cos * 0.928 + sin * 0.072
        ]);
    }

    /** */
    grayscale (value = 1) {
        this.multiply([
            0.2126 + 0.7874 * (1 - value),
            0.7152 - 0.7152 * (1 - value),
            0.0722 - 0.0722 * (1 - value),
            0.2126 - 0.2126 * (1 - value),
            0.7152 + 0.2848 * (1 - value),
            0.0722 - 0.0722 * (1 - value),
            0.2126 - 0.2126 * (1 - value),
            0.7152 - 0.7152 * (1 - value),
            0.0722 + 0.9278 * (1 - value)
        ]);
    }

    /** */
    sepia (value = 1) {
        this.multiply([
            0.393 + 0.607 * (1 - value),
            0.769 - 0.769 * (1 - value),
            0.189 - 0.189 * (1 - value),
            0.349 - 0.349 * (1 - value),
            0.686 + 0.314 * (1 - value),
            0.168 - 0.168 * (1 - value),
            0.272 - 0.272 * (1 - value),
            0.534 - 0.534 * (1 - value),
            0.131 + 0.869 * (1 - value)
        ]);
    }

    /** */
    saturate (value = 1) {
        this.multiply([
            0.213 + 0.787 * value,
            0.715 - 0.715 * value,
            0.072 - 0.072 * value,
            0.213 - 0.213 * value,
            0.715 + 0.285 * value,
            0.072 - 0.072 * value,
            0.213 - 0.213 * value,
            0.715 - 0.715 * value,
            0.072 + 0.928 * value
        ]);
    }

    /** */
    multiply (matrix) {
        const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]),
            newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]),
            newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);

        this.r = newR;
        this.g = newG;
        this.b = newB;
    }

    /** */
    brightness (value = 1) {
        this.linear(value);
    }

    /** */
    contrast (value = 1) {
        this.linear(value, -(0.5 * value) + 0.5);
    }

    /** */
    linear (slope = 1, intercept = 0) {
        this.r = this.clamp(this.r * slope + intercept * 255);
        this.g = this.clamp(this.g * slope + intercept * 255);
        this.b = this.clamp(this.b * slope + intercept * 255);
    }

    /** */
    invert (value = 1) {
        this.r = this.clamp((value + this.r / 255 * (1 - 2 * value)) * 255);
        this.g = this.clamp((value + this.g / 255 * (1 - 2 * value)) * 255);
        this.b = this.clamp((value + this.b / 255 * (1 - 2 * value)) * 255);
    }

    /** */
    hsl () {
        // Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
        const r = this.r / 255,
            g = this.g / 255,
            b = this.b / 255,
            max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s,
            l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        }
        else {
            const d = max - min;

            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            if (max === r) {
                h = (g - b) / d + (g < b ? 6 : 0);
            }
            else if (max === b) {
                h = (b - r) / d + 2;
            }
            else {
                h = (r - g) / d + 4;
            }

            h /= 6;
        }

        return {
            h: h * 100,
            s: s * 100,
            l: l * 100
        };
    }

    /** */
    clamp (value) {
        let val = value;

        if (val > 255) {
            val = 255;
        }
        else if (val < 0) {
            val = 0;
        }
        return val;
    }
}

/** */
export class Solver {
    /** */
    constructor (target, baseColor) {
        this.target = target;
        this.targetHSL = target.hsl();
        this.reusedColor = new Color(0, 0, 0);
    }

    /** */
    solve () {
        const result = this.solveNarrow(this.solveWide());

        return {
            values: result.values,
            loss: result.loss,
            filter: this.css(result.values)
        };
    }

    /** */
    solveWide () {
        const A = 5,
            c = 15,
            a = [60, 180, 18000, 600, 1.2, 1.2];

        let best = {loss: Infinity};

        for (let i = 0; best.loss > 25 && i < 3; i++) {
            const initial = [50, 20, 3750, 50, 100, 100],
                result = this.spsa(A, a, c, initial, 1000);

            if (result.loss < best.loss) {
                best = result;
            }
        }
        return best;
    }

    /** */
    solveNarrow (wide) {
        const A = wide.loss,
            c = 2,
            A1 = A + 1,
            a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];

        return this.spsa(A, a, c, wide.values, 500);
    }

    /** */
    spsa (A, a, c, values, iters) {
        const alpha = 1,
            gamma = 0.16666666666666666,
            deltas = new Array(6),
            highArgs = new Array(6),
            lowArgs = new Array(6);

        let best = null,
            bestLoss = Infinity,
            lossDiff = 0,
            loss = 0;

        for (let k = 0; k < iters; k++) {
            const ck = c / Math.pow(k + 1, gamma);

            for (let i = 0; i < 6; i++) {
                deltas[i] = Math.random() > 0.5 ? 1 : -1;
                highArgs[i] = values[i] + ck * deltas[i];
                lowArgs[i] = values[i] - ck * deltas[i];
            }

            lossDiff = this.loss(highArgs) - this.loss(lowArgs);

            for (let i = 0; i < 6; i++) {
                const g = lossDiff / (2 * ck) * deltas[i],
                    ak = a[i] / Math.pow(A + k + 1, alpha);

                values[i] = this.fix(values[i] - ak * g, i);
            }

            loss = this.loss(values);

            if (loss < bestLoss) {
                best = values.slice(0);
                bestLoss = loss;
            }
        }
        return {values: best, loss: bestLoss};
    }

    /** */
    loss (filters) {
        // Argument is array of percentages.
        const color = this.reusedColor;
        let colorHSL = null;

        color.set(0, 0, 0);

        color.invert(filters[0] / 100);
        color.sepia(filters[1] / 100);
        color.saturate(filters[2] / 100);
        color.hueRotate(filters[3] * 3.6);
        color.brightness(filters[4] / 100);
        color.contrast(filters[5] / 100);

        colorHSL = color.hsl();

        return (
            Math.abs(color.r - this.target.r) +
            Math.abs(color.g - this.target.g) +
            Math.abs(color.b - this.target.b) +
            Math.abs(colorHSL.h - this.targetHSL.h) +
            Math.abs(colorHSL.s - this.targetHSL.s) +
            Math.abs(colorHSL.l - this.targetHSL.l)
        );
    }

    /** */
    css (filters) {
        return `filter: invert(${this.fmt(filters, 0)}%) sepia(${this.fmt(filters, 1)}%) saturate(${this.fmt(filters, 2)}%) hue-rotate(${this.fmt(filters, 3, 3.6)}deg) brightness(${this.fmt(filters, 4)}%) contrast(${this.fmt(filters, 5)}%);`;
    }

    /** */
    fix (value, idx) {
        let max = 100,
            val = value;

        if (idx === 2 /* saturate */) {
            max = 7500;
        }
        else if (idx === 4 /* brightness */ || idx === 5 /* contrast */) {
            max = 200;
        }

        if (idx === 3 /* hue-rotate */) {
            if (val > max) {
                val %= max;
            }
            else if (val < 0) {
                val = max + val % max;
            }
        }
        else if (val < 0) {
            val = 0;
        }
        else if (val > max) {
            val = max;
        }
        return val;
    }

    /** */
    fmt (filters, idx, multiplier = 1) {
        return Math.round(filters[idx] * multiplier);
    }
}

// function hexToRgb (hex) {
//     // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
//     const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

//     hex = hex.replace(shorthandRegex, (m, r, g, b) => {
//         return r + r + g + g + b + b;
//     });

//     const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex);

//     return result
//         ? [
//             parseInt(result[1], 16),
//             parseInt(result[2], 16),
//             parseInt(result[3], 16)
//         ]
//         : null;
// }
