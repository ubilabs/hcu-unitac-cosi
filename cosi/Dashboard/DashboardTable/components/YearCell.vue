<script>
export default {
    name: "YearCell",
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
        },
        currentTimestamp: {
            type: Number,
            default: 0
        },
        timestampPrefix: {
            type: String,
            default: "jahr_"
        }
    }
};

</script>

<template>
    <div>
        <ul class="timestamp-list">
            <li
                v-for="(val, i) in row[column.field]"
                :key="i"
                class="timestamp-list-item"
            >
                <small>
                    {{ val }}
                </small>
            </li>
        </ul>
    </div>
</template>

<style lang="less" scoped>
    ul.timestamp-list {
        padding: 0;
        li.timestamp-list-item {
            text-align: right;
            list-style: none;
            small {
                color: #90c6f5;
            }
        }
    }
</style>
