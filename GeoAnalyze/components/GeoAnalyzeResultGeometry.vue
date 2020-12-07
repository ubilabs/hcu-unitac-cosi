<script>
export default {
    name: "GeoAnalyzeResultGeometry",
    props: {
        results: {
            type: Object,
            required: true
        }
    },
    computed: {
        sum_ew_haupt: function () {
            return this.results?.ew?.[0]?.sum_ew_haupt || "keine Daten vorhanden";
        },
        sum_ew_neben: function () {
            return this.results?.ew?.[0]?.sum_ew_neben || "keine Daten vorhanden";
        },
        schools_sum: function () {
            return this.results?.schools?.[0]?.sum_schulen || "keine Daten vorhanden";
        },
        students_sum: function () {
            return this.results?.schools?.[0]?.sum_schueler || "keine Daten vorhanden";
        },
        sum_kita: function () {
            return this.results?.kitas?.[0]?.sum_kita || "keine Daten vorhanden";
        },
        sum_children: function () {
            return this.results?.kitas?.[0]?.sum_kinder || "keine Daten vorhanden";
        },
        sum_hospitals: function () {
            return this.results?.hospitals?.[0]?.sum_krankenhaus || "keine Daten vorhanden";
        },
        sum_hospitals_beds: function () {
            return this.results?.hospitals?.[0]?.sum_planbetten || "keine Daten vorhanden";
        }
    }
};
</script>

<template lang="html">
    <div>
        <dl class="dl-horizontal">
            <dt>Einwohnerzahl Hauptsitz gesamt:</dt>
            <dd>{{ sum_ew_haupt }}</dd>
            <dt>Einwohnerzahl Nebensitz gesamt:</dt>
            <dd>{{ sum_ew_neben }}</dd>
        </dl>
        <hr>
        <dl class="dl-horizontal">
            <dt>Summe der Schulen:</dt>
            <dd>{{ schools_sum }}</dd>
            <dt>Summe der Schüler:</dt>
            <dd>{{ students_sum }}</dd>
        </dl>
        <hr>
        <dl class="dl-horizontal">
            <dt>Summe der Kitas:</dt>
            <dd>{{ sum_kita }}</dd>
            <dt>Summe der Kinder:</dt>
            <dd>{{ sum_children }}</dd>
        </dl>
        <hr>
        <dl class="dl-horizontal">
            <dt>Summe der Krankenhäuser:</dt>
            <dd>{{ sum_hospitals }}</dd>
            <dt>Summe der Planbettern:</dt>
            <dd>{{ sum_hospitals_beds }}</dd>
        </dl>
    </div>
</template>

<style lang="less" scoped>
    hr {
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .dl-horizontal {
        margin-bottom: 10px;
        dd {
            margin-left: 240px;
        }
        dt {
            font-family: "MasterPortalFont Bold", "Arial Narrow", Arial, sans-serif;
            width: 220px;
        }
    }
</style>
