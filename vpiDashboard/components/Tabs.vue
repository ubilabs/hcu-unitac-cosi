<script>
import Tab from "./Tab.vue";
export default {
    name: "Tabs",
    components: {
        Tab
    },
    data () {
        return {
            selected: false
        };
    }
};
</script>

<template>
    <ul
        class="tab-list center"
        role="tablist"
    >
        <Tab
            tabname="activities"
            :tabindex="0"
            :selected="false"
        />
        <Tab
            tabname="indivuelle besucher"
            :tabindex="1"
            :selected="true"
        />
        <Tab
            tabname="geschlecht"
            :tabindex="2"
            :selected="false"
        />
        <Tab
            tabname="altersgruppe"
            :tabindex="3"
            :selected="false"
        />
        <Tab
            tabname="Verweildauer"
            :tabindex="3"
            :selected="false"
        />
        <Tab
            tabname="besuchertypen"
            :tabindex="3"
            :selected="false"
        />
        <Tab
            tabname="distanz"
            :tabindex="3"
            :selected="false"
        />
    </ul>
</template>

<style lang="scss">
.center {
    justify-content: center;
}
.tab-list {
    list-style: none;
    display: flex;
    padding-left: 0;
    margin-bottom: 0;
}

.tab-list__item[aria-selected=true] {
    font-weight: 700;
    color: white;
    background: #1a1a1a;
}

.tab-list__item:first-child {
    border-radius: 3px 0 0 3px;
}

.tab-list__item {
    padding: 10px 15px;
    cursor: pointer;
    user-select: none;
    transition: border .3s ease-in-out;
    position: relative;
    bottom: -1px;
    font-size: 8px;
    letter-spacing: .2px;
    width: 100%;
    text-align: center;
}
</style>
