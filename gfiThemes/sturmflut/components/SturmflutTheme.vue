<script>
export default {
    name: "SturmflutTheme",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    computed: {
        attributes: function () {
            return this.feature.getMappedProperties();
        }
    }
};
</script>

<template>
    <div class="sturmflut-theme">
        <h1
            id="sturmflut-theme-headline"
        >
            {{ attributes.titel }}
        </h1>
        <table>
            <tbody valign="top">
                <tr>
                    <td
                        id="sturmflut-theme-table-street"
                    >
                        {{ attributes.strasse }}
                    </td>
                </tr>
                <td v-if="attributes.bild_link">
                    <a
                        :href="'https://www.geoportal-hamburg.de/sturmflut/daten/bilder/' + attributes.bild_link"
                        target="_blank"
                    >
                        <img
                            :id="attributes.bildformat === 'quer' ? 'sturmflut-theme-table-image-landscape' : 'sturmflut-theme-table-image-portrait'"
                            :alt="$t('modules.tools.gfi.themes.default.imgAlt')"
                            :src="'https://www.geoportal-hamburg.de/sturmflut/daten/bilder/' + attributes.bild_link"
                        >
                    </a>
                    <p
                        id="sturmflut-theme-table-image-zoom"
                    >
                        Zum vergrößern auf das Bild klicken
                    </p>
                    <p
                        id="sturmflut-theme-table-image-copyright"
                    >
                        Bild: {{ attributes.bild_copyright }}
                    </p>
                </td>
                <td>
                    <p
                        id="sturmflut-theme-table-description"
                        v-html="attributes.beschreibung"
                    />
                    <a
                        v-if="attributes.audio_link"
                        id="sturmflut-theme-table-audio"
                        :href="'https://www.geoportal-hamburg.de/sturmflut/daten/audio/' + attributes.audio_link"
                        target="_blank"
                    >
                        Audiobeitrag anhören
                    </a>
                </td>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss" scoped>
.sturmflut-theme {
    padding: 10px;
    max-width: 500px;
    color: #000;

    p {
        color: #000;
    }

    td {
        padding: 5px;
    }

    #sturmflut-theme-headline {
        color: #000;
        border-bottom: 1px solid #000;
        font-size: 130%;
        margin: 0 0 0.5em 0;
        padding: 5px;
    }

    #sturmflut-theme-table-street {
        font-style: italic;
        padding: 0 0 5px 0;
    }

    #sturmflut-theme-table-image-landscape {
        height: 145px;
        width: 210px;
    }

    #sturmflut-theme-table-image-portrait {
        height: 210px;
        width: 145px;
    }

    #sturmflut-theme-table-image-zoom {
        font-size: 11px;
        color: #666;
        padding: 3px 0;
    }

    #sturmflut-theme-table-description {
        padding: 0 0 3px 0;
    }
}
</style>

<style lang="scss">
    #sturmflut-theme-table-description {
        p {
            color: #000;
        }
    }
</style>
