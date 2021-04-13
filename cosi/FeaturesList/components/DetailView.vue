<script>
import beautifyKey from "../../../../src/utils/beautifyKey";
export default {
    name: "DetailView",
    props: {
        items: {
            required: true,
            type: Object
        }
    },
    mounted () {
        console.log(this.$store);
    },
    methods: {
        beautifyKey: key => beautifyKey(key)
    }
};
</script>

<template>
    <v-sheet>
        <v-card>
            <v-simple-table>
                <template v-slot:default>
                    <tbody class="detail-view-row">
                        <tr
                            v-for="(val, prop) in items"
                            :key="prop"
                        >
                            <th>{{ beautifyKey(prop) }}</th>
                            <td>{{ val }}</td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </v-card>
    </v-sheet>
</template>

<style lang="less">
</style>
