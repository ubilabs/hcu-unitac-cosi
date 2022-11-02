import pdfMake from "pdfmake";

/**
 *
 * @param {*} context is just a vuex action context
 * @param {*} docDefinition is a variable which stores the actual HTML data in the state
 * @returns {*} returns value
 */
function convertHTMLToPDF (context, docDefinition) {

    const doc1 = docDefinition;

    pdfMake.createPdf(doc1).download("Report.pdf");
}

export default {
    convertHTMLToPDF
};
