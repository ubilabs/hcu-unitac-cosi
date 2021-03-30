<script>
export default {
    name: "MenuCell",
    props: {
        rowIndex: {
            required: true,
            type: Number
        },
        column: {
            required: true,
            type: Object
        },
        row: {
            required: true,
            type: Object
        },
        currentTimestamp: {
            type: Number,
            default: 0
        },
        timestampPrefix: {
            type: String,
            default: "jahr_"
        }
    },
    data () {
        return {
            timelineOpen: false
        };
    },
    methods: {
        toggleMenu () {
            console.log("menu open")
        },
        toggleTimeline () {
            this.timelineOpen = !this.timelineOpen;
            console.log("timeline open", this.rowIndex);
        }
    }
};

</script>

<template>
    <div>
        <button
            type="button"
            class="btn btn-default btn-sm transparent"
            title="Info"
            @click="toggleMenu"
        >
            <span class="glyphicon glyphicon-option-vertical" />
        </button>
        <button
            type="button"
            class="btn btn-default btn-xs"
            title="Info"
            @click="toggleTimeline"
        >
            <span :class="['glyphicon', timelineOpen ? 'glyphicon-menu-down' : 'glyphicon-menu-right']" />
        </button>
    </div>
</template>

<style lang="less" scoped>
    button.transparent {
        border: none;
        background: transparent;
        &:hover {
            background: transparent;
            border: none;
        }
    }
</style>
