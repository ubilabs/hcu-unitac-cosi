<script>
import store from "../../../../../src/app-store";

export default {
    name: "YearCell",
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
    }
};

</script>

<template>
    <div>
        <ul class="timestamp-list">
            <li
                v-for="(val, i) in model[prop]"
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
