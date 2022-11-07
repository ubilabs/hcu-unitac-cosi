import html2canvas from "html2canvas";
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

/**
 *
 *
 * This function converts html to pdf
 * @returns {void} returns value
 *
 */
// function convertHTMLToPDF2 () {

//     html2canvas({useCORS: true, allowTaint: true}, document.getElementById("ReportTable"), {
//         onrendered: function (canvas) {
//             const data = canvas.toDataUrl(),
//                 dd = {
//                     content: [{
//                         text: data,
//                         width: 300,
//                         height: 300
//                     }]
//                 };

//             pdfMake.createPdf(dd).download("NewReport.pdf");
//         }
//     });
// }
/**
 *
 *
 * This function converts html to pdf
 * @returns {void} returns value
 *
 */
// function convertHTMLToPDF2 () {
//     const data = [
//             {Kategorie: "123"},
//             {Gruppe: "456"},
//             {Winterhude: "789"}
//         ],

//         doc2 = {
//             content: [
//                 {text: "Hiiii!!!", style: "header"},
//                 table(data, ["Kategorie", "Gruppe", "Winterhude"])
//             ]
//         };

//     pdfMake.createPdf(doc2).download("NewReport.pdf");
// }
/**
 *
 *
 * This function converts html to pdf
 * @param {*} data
 * @param {*} columns
 * @param {*} row
 * @returns {body} returns value
 *
 */
function tableBody (data, columns) {
    const body = [];

    body.push(columns);

    data.forEach(function (row) {
        const dataRow = [];

        columns.forEach(function (column) {
            dataRow.push(row[column].toString());
        });
        body.push(dataRow);
    });
    return body;
}

/**
 *
 *
 * This function converts html to pdf
 * @param {*} data
 * @param {*} columns
 * @returns {body} returns value
 *
 */
function table (data, columns) {
    return {
        table: {
            headerRows: 1,
            body: tableBody(data, columns)
        }
    };
}

/**
 *
 *
 * This function converts html to pdf
 * @param {*} data
 * @param {*} columns
 * @param {*} row
 * @returns {body} returns value
 *
 */
function pdfTest (dataDefinition) {
    // var extData = [
    //         // {name: "Bartek", age: 34, height: 1.78},
    //         // {name: "John", age: 27, height: 1.79},
    //         // {name: "Elizabeth", age: 30, height: 1.80}

    //     ],
    const extData = dataDefinition,

        dd = {
            content: [
                {text: "Fancy Table", style: "header"},
                table(extData, ["Kategorie", "Gruppe", "Winterhude"])
            ]
        };

    pdfMake.createPdf(dd).download("FancyTable.pdf");
}

export default {
    // convertHTMLToPDF,
    // convertHTMLToPDF2,
    pdfTest

};
