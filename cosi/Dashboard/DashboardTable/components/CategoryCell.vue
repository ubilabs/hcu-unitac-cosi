<script>
export default {
    name: "CategoryCell",
    props: {
        rowIndex: {
            required: true,
            type: Number
        },
        column: {
            required: true,
            type: Object
        },
        row: {
            required: true,
            type: Object
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
        <strong>{{ row[column.field] }}</strong>
    </div>
</template>
