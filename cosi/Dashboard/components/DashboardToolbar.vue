<script>
import groupMapping from "../../utils/groupMapping";
import mapping from "../../assets/mapping.json";

export default {
    name: "DashboardToolbar",
    props: {
        statsFeatureFilter: {
            type: Array,
            required: true
        },
        search: {
            type: String,
            required: true
        }
    },
    computed: {
        statsMapping () {
            return groupMapping(mapping);
        },
        _statsFeatureFilter: {
            get () {
                return this.statsFeatureFilter;
            },
            set (value) {
                this.$emit("setStatsFeatureFilter", value);
            }
        },
        _search: {
            get () {
                return this.search;
            },
            set (value) {
                this.$emit("setSearch", value);
            }
        }
    }
};
</script>

<template>
    <v-row
        dense
        align-content="end"
    >
        <v-col cols="5">
            <v-autocomplete
                v-model="_statsFeatureFilter"
                :items="statsMapping"
                item-text="value"
                :label="$t('additional:modules.tools.cosi.featuresList.layerFilter')"
                outlined
                dense
                multiple
                clearable
            >
                <template #selection="{ item, index }">
                    <v-chip
                        v-if="index === 0"
                        small
                    >
                        <span>{{ item.value }}</span>
                    </v-chip>
                    <span
                        v-if="index === 1"
                        class="grey--text text-caption"
                    >
                        (+{{ statsFeatureFilter.length - 1 }} weitere)
                    </span>
                </template>
            </v-autocomplete>
        </v-col>
        <v-col cols="5">
            <v-text-field
                v-model="_search"
                type="text"
                :label="$t('additional:modules.tools.cosi.dashboard.search')"
                append-icon="mdi-magnify"
                outlined
                dense
            />
        </v-col>
        <v-col cols="2">
            <v-icon
                title="Metadaten"
                @click="openMetadata()"
            >
                mdi-information
            </v-icon>
        </v-col>
    </v-row>
</template>
