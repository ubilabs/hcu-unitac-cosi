import pdfMake from "pdfmake";
/**
 *
 * @param {*} context is just a vuex action context
 * @param {*} docDefinition an document definition as as expected by pdfmake package
 * @returns {void}
 */
function downloadPDF (context, docDefinition) {

    pdfMake.createPdf(docDefinition).download("Report.pdf");

}

/**
 *
 *  This function converts data from reportTemplates to pdf
 *
 * @param {*} context is just a vuex action context
 * @param {*} chapters reportTempate's templateItems document definition
 * @returns {void}
 *
 */
function reportTemplateToPDF (context, chapters) {

    const docDefinition = {
        content: []
    };

    /**
     * @param {array} chapter is part that gets added to chapters after each iteration through the json array
     * @return {array} the function returns value of chapter
     */
    function addChapter (chapter) {

        // title, desc, tool, settings are attributes of json file of ReportTemplate with optional styles
        const title = {text: chapter.title, style: "header", bold: true, fontSize: 14},
            desc = {text: chapter.description, style: "header"},
            tool = {text: chapter.tool, style: "header"},
            settings = {text: chapter.settings, style: "header"};

        docDefinition.content.push(title);
        docDefinition.content.push(desc);
        docDefinition.content.push(tool);
        docDefinition.content.push(settings);

        // if the property type is table, then we return the array of headers and body. Headers are for the table headers and body is set of values

        if (chapter.output.type === "table") {
            // let headers = [],
            // body = [];
            const headers = Object.keys(chapter.output.result[0]).map(header => ({
                    border: [false, false, false, true],
                    fillColor: "#dddddd",
                    text: header
                })),

                body = chapter.output.result.map(row => Object.values(row));

            docDefinition.content.push({
                table: {
                    headerRows: 1,
                    body: [headers, ...body]
                }
            });
        }

        // if the property type is image, we put the image into content of docDefinition

        if (chapter.output.type === "image") {

            docDefinition.content.push({
                image: chapter.output.result,
                width: 300,
                height: 300
            });
        }
    }

    chapters.forEach(addChapter);
    // Here we call the pdfMake function to render pdf from the docDefinition
    pdfMake.createPdf(docDefinition).download("ReportTemplate.pdf");
}


export default {
    downloadPDF,
    reportTemplateToPDF

};
