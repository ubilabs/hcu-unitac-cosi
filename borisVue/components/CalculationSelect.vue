<script>
import {mapActions, mapMutations} from "vuex";
import mutations from "../store/mutationsBorisVue";

export default {
    name: "CalculationSelect",
    props: {
        title: {
            type: String,
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        selectedBrwFeature: {
            type: Object,
            required: true
        },
        textIds: {
            type: Array,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        toggleInfoText: {
            type: Function,
            required: true
        },
        handleOptionChange: {
            type: Function,
            required: true
        },
        selectionType: {
            type: String,
            required: true
        }
    },
    methods: {
        ...mapActions("Tools/BorisVue", ["updateSelectedBrwFeature", "sendWpsConvertRequest"]),
        ...mapMutations("Tools/BorisVue", Object.keys(mutations)),
        // to check if Einzelhäuser or Doppelhäuser are selected to change the option name to singular
        checkForBauweiseMatch (option) {

            let zBauweise = this.selectedBrwFeature.get("zBauweise");

            if (this.selectedBrwFeature.get("zBauweise") === "eh Einzelhäuser") {
                zBauweise = "eh Einzelhaus (freistehend)";
            }
            else if (this.selectedBrwFeature.get("zBauweise") === "dh Doppelhaushälften") {
                zBauweise = "dh Doppelhaushälfte";
            }
            return option === zBauweise;
        }
    }

};
</script>

<template>
    <div>
        <dt>
            <span>{{ title }}</span>
            <span
                class="glyphicon glyphicon-question-sign" 
                @click="toggleInfoText(text)"
            />
        </dt>
        <dd>
            <select
                id="zBauwSelect"
                class="form-control"
                @change="handleOptionChange($event, selectionType)"
            >
                <option
                    v-for="(option, i) in options"
                    :key="i"
                    :value="option"
                    :SELECTED="checkForBauweiseMatch(option)"
                >
                    {{ option }}
                </option>
            </select>
            <div
                v-if="Object.values(textIds).includes(text)"
                class="help"
            >
                <span v-html="text" />
                <br>
            </div>
        </dd>
    </div>
</template>

<style  lang="scss" scoped>
    dt {
        background-color: rgba(227, 227, 227, 0.5);
        font-family: "UniversNextW04-620CondB", "Arial Narrow", Arial, sans-serif;
        padding: 8px;
    }
    dd{
        padding: 8px;
        word-wrap: break-word;
    }

</style>
