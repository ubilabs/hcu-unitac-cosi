/* eslint-disable one-var */
import * as XLSX from "xlsx";

/**
 * @description returns the width definition for the table columns by reading out the headers char-length
 * @param {String[]} headers - the headers of the table columns
 * @param {Number} [multiply] - multiply the col header length by
 * @returns {Object[]} the column Options array for all columns of the table
 */
function generateColOptions (headers, multiply) {
    const _multiply = multiply || 2;

    return headers.map(header => ({
        wch: header.length * _multiply
    }));
}

/**
 * @description Converts a json array of objects to an styled and exportable XLSX format.
 * @param {Object[]} json - the array of objects to export
 * @param {Object} [options={}] - (optional) sheetname: name of the worksheet, tablename: name of the table, creator: editor of the document, theme: the styletheme of the table
 * @returns {module:exceljs/workbook} returns the XLSX workbook
 */
export function parseJsonToXlsx (json, options) {
    const sheetname = options.sheetname.substring(0, 31) || "Neues Arbeitsblatt", // no names longer than 31 chars allowed

        header = Object.keys(json[0]),
        colOptions = options.colOptions || generateColOptions(header, options.multiplyColWidth),
        rowOptions = options.rowOptions,
        workbook = XLSX.utils.book_new(),
        sheet = XLSX.utils.json_to_sheet(json, {header});

    sheet["!cols"] = colOptions;
    sheet["!rows"] = rowOptions;
    XLSX.utils.book_append_sheet(workbook, sheet, sheetname);

    return workbook;
}

/**
 * @description Exports a given JSON Array of Objects to an XLSX-File with each object's keys as column-headers and resp. values as rows.
 * @param {Object[]} json - the array of objects to export
 * @param {String} filename - the filename of the exported XLSX
 * @param {Object} [options={}] - (optional) exlcude: keys to exclude from columns, sheetname: name of the worksheet, rowOptions: height etc., colOptions: width etc.
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
        rowOptions: options.rowOptions,
        colOptions: options.colOptions,
        multiplyColWidth: options.multiplyColWidth
    });

    XLSX.writeFile(workbook, filename + ".xlsx");
    return true;
}

