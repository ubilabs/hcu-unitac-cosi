<script>
import {mapGetters, mapActions} from "vuex";
import getters from "../store/gettersSchoolRoutePlanning";
import actions from "../store/actionsSchoolRoutePlanning";

export default {
    name: "SchoolRoutePlanningAddressList",
    props: {
        layer: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters("Tools/SchoolRoutePlanning", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/SchoolRoutePlanning", Object.keys(actions))
    }

};
</script>

<template>
    <div
        v-if="streetNames.length > 0 && inputAddress !== ''"
        class="row"
    >
        <ul
            class="list-group address-list col-xs-12"
        >
            <div v-if="streetNames.length > 1">
                <li
                    v-for="streetName in streetNames.slice(0, 5)"
                    :key="streetName"
                    class="list-group-item street"
                    @click="searchHousenumbers({streetName, eventType: 'click'})"
                >
                    {{ streetName }}
                </li>
            </div>
            <div v-else>
                <li
                    v-for="houseNumber in filteredHouseNumbers.slice(0, 5)"
                    :key="houseNumber.name"
                    class="list-group-item address"
                    @click="findHouseNumber({input: houseNumber.name, layer})"
                >
                    {{ houseNumber.name }}
                </li>
            </div>
        </ul>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";
@background_color_1: #e3e3e3;

    .address-list {
        z-index: 3;
        padding-left: 15px;
        li {
            &:first-child {
                border-top: 0;
            }
            &:hover {
                cursor: pointer;
                background-color: @background_color_1;
            }
        }
    }
</style>
