<script>
export default {
    name: "Tab",
    props: {
        tabname: {
            type: String,
            required: true
        },
        tabindex: {
            type: Number,
            required: true
        },
        selected: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        trigger (tab) {
            console.log(tab);
        }
    }
};
</script>
<template>
    <li class="tab-list__item" :tabindex="tabindex" role="tabItem" :aria-selected="selected" aria-disabled="false">
        <div class="tab-title" @click="trigger(tabname)">{{ tabname }}</div>
    </li>
</template>
<style scoped>

</style>
