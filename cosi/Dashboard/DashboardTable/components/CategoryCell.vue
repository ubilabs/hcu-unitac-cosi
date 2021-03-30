<script>
import store from "../../../../../src/app-store";

export default {
    name: "CategoryCell",
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
            isSelected: false
        };
    },
    watch: {
        isSelected () {
            console.log(this.rowIndex);
        }
    }
};

</script>

<template>
    <div class="form-group">
        <input
            v-model="isSelected"
            class="form-check-input"
            type="checkbox"
        />
        <strong>{{ model[prop] }}</strong>
    </div>
</template>
