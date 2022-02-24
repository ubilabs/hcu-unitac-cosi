<script>
import Detail from "./Detail.vue";

export default {
    name: "DetailInformation",
    components: {
        Detail
    },
    props: {
        title: {
            type: String,
            required: true
        },
        selectedBrwFeature: {
            type: Object,
            required: true
        },
        buttonValue: {
            type: String,
            required: true
        }
    }
};
</script>

<template>
    <div>
        <div v-if="buttonValue === 'info'">
            <h4>{{ title }}</h4>
            <dl>
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['entwicklungszustand']"
                    :label="'Entwicklungszustand'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['beitragszustand']"
                    :label="'Beitrags- u. abgabenrechtl. Zustand'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['sanierungszusatz']"
                    :label="'Sanierungs- oder Entwicklungszusatz'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['nutzung_kombiniert']"
                    :label="'Art der Nutzung'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['anbauart']"
                    :label="'Anbauart'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['geschossfl_zahl']"
                    :label="'Wertrelevante Geschossflächenzahl (WGFZ):'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['grdstk_flaeche']"
                    :label="'Grundstücksfläche'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['bemerkung']"
                    :label="'weitere Merkmale:'"
                />
                <div
                    v-if="parseInt(selectedBrwFeature.get('jahrgang'), 10) >= 2002"
                >
                    <dt>Bodenrichtwert:</dt>
                    <dd>{{ selectedBrwFeature.get('richtwert_euro') }} €/m²</dd>
                </div>
                <div
                    v-else
                >
                    <dt>Bodenrichtwert:</dt>
                    <dd>
                        <span>{{ selectedBrwFeature.get('richtwert_euro') }} €/m²</span>
                        <span class="pull-right">{{ selectedBrwFeature.get('richtwert_dm') }} DM/m²</span>
                    </dd>
                </div>
            </dl>
        </div>
        <div v-if="buttonValue === 'lage'">
            <h4>{{ title }}</h4>
            <dl>
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['postleitzahl', 'gemeinde']"
                    :label="'PLZ, Gemeinde'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['bezirk']"
                    :label="'Bezirk'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['stadtteil']"
                    :label="'Stadtteil'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['statistisches_gebiet']"
                    :label="'SGE (Stat. Gebietseinheit)'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['baublock']"
                    :label="'Baublock'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['strassenname', 'hausnummer', 'hausnummerzusatz']"
                    :label="'Adresse'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['lagebezeichnung']"
                    :label="'Weitere Lagebezeichnung'"
                />
                <Detail
                    :feature="selectedBrwFeature"
                    :keys="['bezeichnung_sanierungsgebiet']"
                    :label="'Sanierungsgebiet'"
                />
            </dl>
        </div>
    </div>
</template>

<style lang="scss" scoped>
dt {
    background-color: rgba(227, 227, 227, 0.5);
    font-family: "UniversNextW04-620CondB", "Arial Narrow", Arial, sans-serif;
    padding: 8px;
};
dd{
    padding: 8px;
    word-wrap: break-word;
}
</style>
