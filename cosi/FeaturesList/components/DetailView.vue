<script>
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
    }
};
</script>

<template>
    <v-container fluid>
        <v-sheet>
            <v-simple-table>
                <template v-slot:default>
                    <tbody class="detail-view-row">
                        <tr
                            v-for="(val, prop) in items"
                            :key="prop"
                        >
                            <th>{{ prop }}</th>
                            <td>{{ val }}</td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
        </v-sheet>
    </v-container>
</template>

<style lang="less">
</style>
