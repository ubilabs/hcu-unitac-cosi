<script>
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";

/**
 * @todo Make a util to read the icon of a feature
 */
export default {
    name: "FeatureIcon",
    props: {
        item: {
            required: true,
            type: Object
        }
    },
    computed: {
        style () {
            return Array.isArray(this.item.style) ? this.item.style[0] : this.item.style;
        }
    },
    methods: {
        /**
         * @description
         * @returns {String | undefined} returns the source url of the img
         */
        getIconSrc () {
            if (this.style?.getImage()?.constructor === Icon) {
                return this.style.getImage().getSrc();
            }
            return undefined;
        },
        /**
         * @returns {module:ol/Style | undefined} the Circle Style
         */
        getCircleStyle () {
            if (this.style?.getImage()?.constructor === CircleStyle) {
                return this.style.getImage();
            }
            return undefined;
        },
        /**
         * @param {module:ol/Style} style - the style object to read
         * @returns {String} the color
         */
        getBgColor (style) {
            return this.convertColor(style?.getFill()?.getColor()) || "grey";
        },
        /**
         * @param {module:ol/Style} style - the style object to read
         * @returns {String} the color
         */
        getBorderColor (style) {
            return this.convertColor(style?.getStroke()?.getColor()) || "grey";
        },
        /**
         * @param {number[] | String} color - the color to convert
         * @returns {String} the color string
         */
        convertColor (color) {
            if (color?.constructor === Array) {
                return color.length === 3 ? `rgb(${color.toString()})` : `rgba(${color.toString()})`;
            }
            if (color?.constructor === String) {
                return color;
            }
            return undefined;
        },
        /**
         * @param {module:ol/Style} style - the style object to read
         * @returns {String} the stroke width
         */
        getBorderWidth (style) {
            return style?.getStroke()?.getWidth() + "px" || "0px";
        }
    }
};
</script>

<template>
    <span>
        <img
            v-if="getIconSrc()"
            class="marker"
            :src="getIconSrc()"
            alt="no img"
        />
        <span
            v-else-if="getCircleStyle()"
            class="marker"
            :style="{
                backgroundColor: getBgColor(getCircleStyle()),
                borderWidth: getBorderWidth(getCircleStyle()),
                borderColor: getBorderColor(getCircleStyle())
            }"
        />
        <span
            v-else
            class="marker"
            :style="{
                backgroundColor: getBgColor(style),
                borderWidth: getBorderWidth(style),
                borderColor: getBorderColor(style)
            }"
        />
    </span>
</template>

<style lang="less" scoped>
    .marker {
        width: 30px;
        height: 30px;
        display: block;
    }
    span.marker {
        border-style: solid;
        border-radius: 50%;
    }
</style>
