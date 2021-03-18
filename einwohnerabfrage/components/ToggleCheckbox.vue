<script>
export default {
    name: "ToggleCheckbox",
    props: {
        defaultState: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            currentState: false
        };
    },

    computed: {
        isActive () {
            return this.currentState;
        },

        textOn: function () {
            return this.$t("common:snippets.checkbox.on");
        },

        textOff: function () {
            return this.$t("common:snippets.checkbox.off");
        },

        checkedValue: {
            get () {
                return this.currentState;
            },
            set (newValue) {
                this.currentState = newValue;
                this.$emit("change", newValue);
            }
        }
    },

    beforeMount () {
        this.currentState = this.defaultState;
    },

    methods: {
        toggle: function () {
            this.currentState = !this.currentState;

            this.$emit("change", this.currentState);
        }
    }
};
</script>

<template>
    <div
        class="togglecheckboxcomponent toggle btn btn-default btn-sm"
        :class="{'off': !isActive}"
    >
        <input
            v-model="checkedValue"
            type="checkbox"
            title="Filter aussschalten"
            data-toggle="toggle"
            :checked="isActive"
            @click="toggle"
        />
        <div class="toggle-group">
            <label
                class="btn btn-primary btn-sm toggle-on"
                :class="{'active': isActive}"
                @click="toggle"
            >
                {{ textOn }}
            </label>
            <label
                class="btn btn-default btn-sm toggle-off"
                :class="{'active': !isActive}"
                @click="toggle"
            >
                {{ textOff }}
            </label>
            <span class="toggle-handle btn btn-default btn-sm"></span>
        </div>
    </div>
</template>

<style lang="less" scoped>
    div.togglecheckboxcomponent {
        width:63px;
    }
</style>
