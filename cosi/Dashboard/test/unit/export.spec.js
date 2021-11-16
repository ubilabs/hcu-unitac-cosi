import {expect} from "chai";
import {prepareTableExportWithTimeline} from "../../utils/export";
import data from "./data.json";
import expectedExportData from "./expectedExportData.json";


describe("Dashboard/utils/export", () => {
    it("prepareTableExportWithTimeline should not reverse timestamps argument", () => {
        const timestamps = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
            timestampsCopy = [...timestamps],

            exportData = prepareTableExportWithTimeline(data, timestampsCopy, "jahr_");

        expect(exportData).to.be.eql(expectedExportData);
        expect(timestampsCopy).to.be.eql(timestamps);
    });
});
