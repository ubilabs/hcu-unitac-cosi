import pdfMake from "pdfmake";
/**
 *
 * @param {*} context is just a vuex action context
 * @param {*} docDefinition a document definition as as expected by pdfmake package
 * @returns {void}
 */
function downloadPDF (context, docDefinition) {

    pdfMake.createPdf(docDefinition).download("Report.pdf");

}

/**
 *
 *  This function converts data from reportTemplates to pdf
 *
 * @param {*} context vuex context
 * @param {*} chapters reportTempate addon's templateItems definition
 * @returns {void}
 *
 */
function reportTemplateToPDF (context, chapters) {

    const docDefinition = {
        content: [],
        pageOrientation: "landscape",
        pageSize: "A4"
    };

    /**
     * @param {array} chapter is part that gets added to chapters after each iteration through the json array
     * @return {array} the function returns value of chapter
     */
    function addChapter (chapter) {
        // title, desc, tool, settings are attributes of json file of ReportTemplate with optional styles
        const title = {text: chapter.title, style: "header", bold: true, fontSize: 14},
            desc = {text: chapter.description, style: "header"},
            tool = {text: chapter.tool, style: "header"};
        let sourceInfo = "Quelleninformation fehlt.";

        console.log(chapter.output.sourceInfo);
        if (chapter.output.sourceInfo) {
            // simplify nested object into array of arrays
            // sourceInfo = Object.values(chapter.output.sourceInfo).map(Object.values).map(x=>{
            //     return x.flat();
            // });

            sourceInfo = Object.values(chapter.output.sourceInfo).map((metadata)=>{
                return Object.values(metadata).map((info, index)=>{
                    return Object.keys(metadata)[index] + ": " + info;
                });
            });
            console.log(sourceInfo);
            sourceInfo = sourceInfo.map(x=>{ // add line breaks between sources
                return [x, "\n"];
            });
            // sourceInfo = Object.values(item.output.sourceInfo).map((metadata) => { // for each meta data entry..
            //     return Object.values(metadata).map((x, i) => { // for each piece of information in  the entry..
            //         return Object.keys(metadata)[i] + ": " + x; // concatenate keys to values..
            //     }).join("<br>"); // combine this metadata entry to single string..
            // }).join("<br><br><br>"); // combine all metadata entries together to single string

        }
        console.log(chapter);
        // sourceInfo = {text: chapter.sourceInfo, style:""};
        // settings = {text: chapter.settings, style: "header"};

        docDefinition.content.push(title);
        docDefinition.content.push("\n"); // add line break
        docDefinition.content.push(desc);
        docDefinition.content.push("\n"); // add line break
        docDefinition.content.push(tool);
        docDefinition.content.push("\n"); // add line break
        // docDefinition.content.push(settings);

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
                },
                fontSize: 8,
                pageBreak: "after"
            });


        }

        // if the property type is image, we put the image into content of docDefinition

        if (chapter.output.type === "image") {

            docDefinition.content.push({
                image: chapter.output.result,
                width: 500,
                pageBreak: "after"
            });
        }

        docDefinition.content.push("\n"); // add line break
        docDefinition.content.push("\n"); // add line break
        docDefinition.content.push("Datenquellen:\n\n", sourceInfo);
    }

    chapters.forEach(addChapter);
    // Here we call the pdfMake function to render pdf from the docDefinition
    pdfMake.createPdf(docDefinition).download("ReportTemplate.pdf");
}


export default {
    downloadPDF,
    reportTemplateToPDF

};
