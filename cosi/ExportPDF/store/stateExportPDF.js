// import html from "text-loader!../assets/test.html";
import html from "text-loader!../assets/NotTestFile.html";
import rawJson from "../assets/beispiel_report_template.json";

export default {
    active: false,
    id: "ExportPDF",
    name: "Export PDF",
    icon: "bi-printer",

    isVisibleInMenu: true, // optional
    renderToWindow: true,
    resizableWindow: false,
    deactivateGFI: true,
    // htmlToConvert: "<img id=\"pic\" src=\"../assets/cat.png\" width=\"250\" height=\"250\"></img>",
    htmlToConvert1: html,
    docDefinition: {
        content: [
            {
                // image: "../assets/cat.png",

                table: {
                    body: [
                        ["Column 1", "Column 2", "Column 3"],
                        [
                            {
                                stack: [
                                    "Let's try an unordered list",
                                    {
                                        ul: [
                                            "item 1",
                                            "item 2"
                                        ]
                                    }
                                ]
                            },
                            [
                                "or a nested table",
                                {
                                    table: {
                                        body: [
                                            ["Col1", "Col2", "Col3"],
                                            ["1", "2", "3"],
                                            ["1", "2", "3"]
                                        ]
                                    }
                                }
                            ],
                            {text: [
                                "Inlines can be ",
                                {text: "styled\n", italics: true},
                                {text: "easily as everywhere else", fontSize: 10}]
                            }
                        ]
                    ]
                }
            }
        ]
    },

    dataDefinition: {
        content: [
            html
        ]},

    jsonData: rawJson

};
