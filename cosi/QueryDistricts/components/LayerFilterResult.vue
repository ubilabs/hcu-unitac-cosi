
<script>
export default {
    name: "LayerFilterResult",
    props: {
        name: {
            type: String,
            default: null
        },
        field: {
            type: String,
            default: null
        },
        value: {
            type: Number,
            default: NaN
        },
        low: {
            type: Number,
            default: 0
        },
        high: {
            type: Number,
            default: 0
        }
    }
};
</script>

<template lang="html">
    <div class="filter-result-panel">
        <p><strong>{{ name }}</strong></p>
        <table class="table filter-result-table">
            <tr>
                <th scope="col">
                    Jahr
                </th>
                <th scope="col">
                    Referenzwert
                </th>
                <th scope="col">
                    -
                </th>
                <th scope="col">
                    +
                </th>
            </tr>
            <tr>
                <td>{{ field }}</td>
                <td>{{ value }}</td>
                <td>{{ low }}</td>
                <td>{{ high }}</td>
            </tr>
        </table>
    </div>
</template>

<style lang="less" scoped>
.filter-result-table{
    td {
        border-bottom: 1px solid #ddd;
        background-color:white;
    }
    background-color: white;
}
.filter-result-panel {
    padding-bottom: 10px;
}
</style>


