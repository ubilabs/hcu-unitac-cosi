/* eslint-disable one-var */
// import * as Excel from "exceljs";
// import {saveAs} from "file-saver"
import * as XLSX from "xlsx";
// import downloadBlobToFile from "./downloadBlobToFile";

/**
 * @description Converts a json array of objects to an styled and exportable XLSX format.
 * @param {Object[]} json - the array of objects to export
 * @param {Object} [options={}] - (optional) sheetname: name of the worksheet, tablename: name of the table, creator: editor of the document, theme: the styletheme of the table
 * @returns {module:exceljs/workbook} returns the XLSX workbook
 */
export function parseJsonToXlsx (json, options) {
    const sheetname = options.sheetname.substring(0, 31) || "Neues Arbeitsblatt", // no names longer than 31 chars allowed
        tablename = options.tablename || options.sheetname || "Neue Tabelle",
        creator = options.creator,
        theme = options.theme,

        sheet = XLSX.utils.json_to_sheet(json),
        workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, sheet, sheetname);


    //     workbook = new Excel.Workbook(),
    //     // sheet = workbook.addWorksheet(sheetname),
    //     columns = Object.keys(json[0]).map(key => ({name: key, filterButton: true})),
    //     rows = json.map(row => Object.values(row)),
    //     table = {
    //         name: tablename,
    //         ref: "A1",
    //         headerRow: true,
    //         style: {
    //             theme: theme || "TableStyleDark3",
    //             showRowStripes: true
    //         },
    //         columns,
    //         rows
    //     };

    // // sheet.addTable(table);
    // workbook.creator = creator || "CoSI";
    // workbook.created = new Date();
    // workbook.modified = new Date();
    // workbook.lastPrinted = new Date();

    return workbook;
}

/**
 * @description Exports a given JSON Array of Objects to an XLSX-File with each object's keys as column-headers and resp. values as rows.
 * @param {Object[]} json - the array of objects to export
 * @param {String} filename - the filename of the exported XLSX
 * @param {Object} [options={}] - (optional) exlcude: keys to exclude from columns, sheetname: name of the worksheet, tablename: name of the table, creator: editor of the document, theme: the styletheme of the table
 * @returns {void}
 */
export default async function exportXlsx (json, filename, options = {}) {
    if (!json || json.length === 0) {
        console.warn("Die zu exportierende Tabelle ist leer oder existiert nicht, bitte überprüfen Sie Ihre Einstellungen");
        return false;
    }

    const exportJson = JSON.parse(JSON.stringify(json)),
        exclude = options.exclude;

    // remove excluded columns
    if (exclude) {
        exportJson.forEach(column => {
            exclude.forEach(key => {
                delete column[key];
            });
        });
    }

    const workbook = parseJsonToXlsx(exportJson, {
        sheetname: options.sheetname || filename,
        tablename: options.tablename,
        creator: options.creator,
        theme: options.theme
    });

    XLSX.writeFile(workbook, filename + ".xlsx");

    // const workbook = parseJsonToXlsx(exportJson, {
    //         sheetname: options.sheetname || filename,
    //         tablename: options.tablename,
    //         creator: options.creator,
    //         theme: options.theme
    //     }),

    // const sheet = XLSX.utils.json_to_sheet(exportJson);
    // const workbook = XLSX.utils.book_new();

    // XLSX.utils.book_append_sheet(workbook, sheet, filename);
    // XLSX.writeFile(workbook, filename + ".xlsx");
    // buffer = workbook.xlsx.writeBuffer(),
    // fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // fileExtension = ".xlsx",
    // blob = new Blob([buffer], {type: fileType});

    // saveAs(blob, filename + fileExtension);
    return true;
    // return downloadBlobToFile(blob, filename + fileExtension);
}

