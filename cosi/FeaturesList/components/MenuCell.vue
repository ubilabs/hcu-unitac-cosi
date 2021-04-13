<script>
import store from "../../../../src/app-store";

export default {
    name: "MenuCell",
    props: {
        prop: {
            required: true,
            type: String
        },
        rowIndex: {
            required: true,
            type: Number
        },
        model: {
            required: true,
            type: Object
        },
        column: {
            type: Object,
            required: true
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
            this.$emit("someEvent", this.timelineOpen);
            // store.commit("Tools/DashboardTable/toggleTimelineRow", {timelineOpen: this.timelineOpen, rowIndex: this.rowIndex});
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
