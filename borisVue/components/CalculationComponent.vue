<script>
import {mapActions, mapMutations} from "vuex";
import mutations from "../store/mutationsBorisVue";

export default {
    name: "CalculationComponent",
    props: {
        title: {
            type: String,
            required: true
        },
        // only for select, if input oins BorisVue.vue --> :optopns: []
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
        handleChange: {
            type: Function,
            required: true
        },
        // zGrdstk_flaeche, zGeschossfl_zahl, zStrassenLage, zBauweise
        subject: {
            type: String,
            required: true
        },
        // select or input
        type: {
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
        <!-- CalculationSelect -->
        <div v-if="type === 'select'">
            <dt>
                <span>{{ title }}</span>
                <span
                    class="glyphicon glyphicon-question-sign" 
                    @click="toggleInfoText(text)"
                />
            </dt>
            <dd>
                <select
                    class="form-control"
                    @change="handleChange($event, subject)"
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
        <!-- CalculationInput -->
        <div v-else>
            <dt>
                <span>{{ title }}</span>
                <span
                    class="glyphicon glyphicon-question-sign" 
                    @click="toggleInfoText(text)"
                />
            </dt>
            <dd>
                <label>
                    <input
                        type="text"
                        class="form-control"
                        :value="selectedBrwFeature.get(subject).toString().replace('.', ',')"
                        @change="handleChange($event, subject)"
                    >
                </label>
                <div
                    v-if="Object.values(textIds).includes(text)"
                    class="help"
                >
                    <span v-html="text" />
                    <br>
                </div>
            </dd>
        </div>
    </div>
</template>
