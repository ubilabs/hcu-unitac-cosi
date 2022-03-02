<script>

export default {
    name: "FloorComponent",
    props: {
        title: {
            type: String,
            required: true
        },
        feature: {
            type: Object,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    }
};
</script>

<template>
    <div>
        <h4>{{ title }} </h4>
        <span> {{ label }} </span>
        <br>
        <br>
        <div v-if="feature.schichtwerte">
            <div
                v-for="(schichtwert, index) in feature.schichtwerte"
                :key="index"
            >
                <h5> {{ schichtwert.geschoss }} </h5>
                <dl>
                    <dt>Anteilige WGFZ:</dt>
                    <dd>{{ schichtwert.wgfz }}</dd>
                    <dt>Nutzung:</dt>
                    <dd>{{ schichtwert.nutzung }}</dd>
                    <dt>Schichtwert:</dt>
                    <dd
                        v-if="schichtwert.schichtwertDM === ''"
                    >
                        {{ schichtwert.schichtwert }} €/m² WGF
                    </dd>
                    <dd
                        v-else
                    >
                        <span>{{ schichtwert.schichtwert }} €/m² WGF</span><span class="pull-right"> {{ schichtwert.schichtwertDM }} DM/m² WGF</span>
                    </dd>
                </dl>
            </div>
        </div>
        <div v-else>
            <dl>
                <dt> {{ Object.values(feature)[0] }}: </dt>
                <dd v-if="Object.values(feature)[2] === ''">
                    <span> {{ Object.values(feature)[1] }} €/m²</span>
                </dd>
                <dd v-else>
                    <span> {{ Object.values(feature)[1] }} €/m²</span>
                    <span class="pull-right">{{ Object.values(feature)[2] }} DM/m²</span>
                </dd>
            </dl>
        </div>
    </div>
</template>

<style  lang="scss" scoped>
h5 {
    font-weight: bolder;
};
</style>
