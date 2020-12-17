import Feature from "ol/Feature.js";
import VectorLayer from "ol/layer/Vector.js";

const gfiOnAddressSearch = Backbone.Model.extend({
    /*
     * Events werden von searchbar getriggert.
     */
    defaults: {
        streetName: "",
        houseNumbers: []
    },
    initialize: function () {
        this.listenTo(Radio.channel("Searchbar"), {
            "hit": this.searchbarhit
        }, this);

        this.listenTo(Radio.channel("Gaz"), {
            "getAdress": this.adressHit,
            "getStreets": this.streetHit
        }, this);
    },

    /**
     * If an address is selected (via findeStrasse), detailed information must be retrieved.
     * @param {string} address - The addresse that was klicked.
     * @fires Searchbar#RadioTriggerSearchbarStreetSearch
     * @fires Searchbar#RadioTriggerSearchbarAdressSearch
     * @returns {void}
     */
    searchbarhit: function (address) {
        if (address?.type === "Straße") {
            this.setStreetName(address.name);
            Radio.trigger("Gaz", "streetsSearch", address);
        }
        else if (address?.type === "Adresse") {
            Radio.trigger("Gaz", "adressSearch", address.adress);
            this.trigger("close");
        }
    },
    streetHit: function (data) {
        const streetname = this.get("streetName");

        let houseNumbers = this.prepareHouseNumbers(streetname, data);

        houseNumbers = this.sortHouseNumbers(houseNumbers);
        this.setHouseNumbers(houseNumbers);
        this.trigger("render");
    },

    /**
     * Sorts housenumbers.
     * @param {object[]} houseNumbers - The housenumbers from gazetter.
     * @fires Core#RadioRequestUtilIsSort
     * @returns {object[]} The sorted housenumbers
     */
    sortHouseNumbers: function (houseNumbers) {
        return Radio.request("Util", "sort", "", houseNumbers, "number", "affix");
    },

    prepareHouseNumbers: function (streetName, houseNumbers) {
        const houseNumbersArray = [];

        houseNumbers.forEach(function (houseNumber) {
            const nr = houseNumber.adress.housenumber,
                affix = houseNumber.adress.affix === undefined ? undefined : houseNumber.adress.affix;

            houseNumbersArray.push({
                nr: nr,
                affix: affix
            });
        });
        return houseNumbersArray;
    },
    addressClicked: function (streetname, housenumber, affix) {
        const addressObj = {streetname: streetname,
            housenumber: housenumber.trim(),
            affix: affix};

        Radio.trigger("Gaz", "adressSearch", addressObj);
        this.trigger("close");
    },
    /*
     * Verarbeiten der GAGES-Informationen und öffnen des GFI
     */
    adressHit: function (data) {
        const gages = $("gages\\:Hauskoordinaten,Hauskoordinaten", data)[0],
            attributes = {},
            coordinates = $(gages).find("gml\\:pos, pos")[0].textContent.split(" ");

        let i,
            adressString;

        for (i = 0; i < coordinates.length; i++) {
            coordinates[i] = parseFloat(coordinates[i]);
        }

        $(gages).find("*").filter(function () {
            return this.nodeName.indexOf("dog") !== -1 || this.nodeName.indexOf("gages") !== -1;
        }).each(function () {
            Object.assign(attributes, Radio.request("Util", "toObject", [this.nodeName.split(":")[1]], [this.textContent]));
        });

        // Syntaktischer Aufbau der Adressbezeichnung
        adressString = attributes.strassenname;
        adressString = attributes.hausnummer ? adressString + " " + attributes.hausnummer : adressString;
        adressString = attributes.hausnummernzusatz ? adressString + attributes.hausnummernzusatz : adressString;

        Radio.trigger("GFI", "setGfiParams", {
            typ: "WFS",
            feature: new Feature(attributes),
            // attributes: "showAll",
            attributes: {
                "strassenname": "Straßenname",
                "hausnummer": "Hausnummer",
                "hausnummernzusatz": "Buchstabe/Adressierungszusatz",
                "strasse_kurz": "Straßenschlüssel",
                "postleitzahl": "Postleitzahl",
                "status": "Amtlich vergebene Adresse",
                "bezirke": "Bezirk",
                "postOrtsteil": "Stadtteil",
                "ortsteil_kurz": "Ortsteil",
                "baubloecke": "Baublock",
                "statistischesgebiet": "Statistisches Gebiet",
                "alkis_flurstuecksnummer": "Flurstücksnummer",
                "alkis_gemarkung": "Gemarkung",
                "amtsgericht": "Amtsgericht",
                "amtsgericht_name": "Name des Amtsgerichtes",
                "finanzamtnr": "Finanzamt",
                "finanzamt": "Name des Finanzamtes",
                "grundbuchbezirk": "Grundbuchschlüssel",
                "polizeikommissariat": "Polizeikommissariat",
                "grundschulnr": "Grundschulnummer",
                "grundschule": "Name der Grundschule",
                "wahlbezirk": "Wahlbezirk (Bezirksversammlungswahl 2019)",
                "wahlkreisbt": "Wahlkreis (Bundestagswahl 2017)",
                "wahlkreisbu": "Wahlkreis (Bürgerschaftswahl 2015)",
                "wahlkreis_bv": "Wahlkreis (Bezirksversammlungswahl 2019)"
            },
            name: "Adressinformation zu: " + adressString,
            ol_layer: new VectorLayer({
                typ: this.get("typ")
            }),
            gfiTheme: "sgvonline",
            coordinates: coordinates});
    },

    // setter for streetName
    setStreetName: function (value) {
        this.set("streetName", value);
    },

    // setter for housenumbers
    setHouseNumbers: function (value) {
        this.set("houseNumbers", value);
    }
});

export default gfiOnAddressSearch;
