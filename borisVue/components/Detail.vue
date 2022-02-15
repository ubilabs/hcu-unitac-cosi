<script>
export default {
    name: "Detail",
    props: {
        feature: {
            type: Object,
            required: true
        },
        keys: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    },
    watch: {
        feature: {
            handler (newVal, oldVal) {
                if (oldVal) {
                    console.log("new feature selected:", newVal);
                }
            },
            immediate: true
        }
    },
    methods: {
        getValue(){
            let value = "";

            this.keys.forEach(key => {
               value += this.feature.get(key);
               value += " ";
            });
            return value.substring(0, value.length -1);
        }
    }
};
</script>

<template>
     <div
        v-if="Object.keys(feature).length > 0 && feature.get(keys[0])"
    >
        <dt>{{label}}:</dt>
        <dd>{{ getValue() }}</dd>
    </div>
</template>

<style lang="scss" scoped>
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
