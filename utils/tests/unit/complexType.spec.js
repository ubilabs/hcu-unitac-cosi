import {expect} from "chai";
import {convertComplexTypeToPiechart, isComplexType} from "../../../utils/complexType.js";

describe("addons/utils/convertComplexTypeToPiechart.js", () => {
    describe("convertComplexTypeToPiechart", () => {
        it("should convert complex data to chartJS data", () => {
            const complexData =
                    {
                        metadata: {
                            type: "timeseries",
                            format: "YYYY/YY",
                            description: "Anzahl"
                        },
                        values: [
                            {key: "2019/20", value: 372},
                            {key: "2018/19", value: 392},
                            {key: "2017/18", value: 398},
                            {key: "2016/17", value: 381},
                            {key: "2015/16", value: 384}
                        ]
                    },
                chartJSData =
                    {
                        datasets: [
                            {
                                label: "Anzahl",
                                data: [
                                    372,
                                    392,
                                    398,
                                    381,
                                    384
                                ],
                                backgroundColor: [
                                    "rgba(230, 159, 0, 1)",
                                    "rgba(86, 180, 233, 1)",
                                    "rgba(0, 158, 115, 1)",
                                    "rgba(240, 228, 66, 1)",
                                    "rgba(0, 114, 178, 1)"
                                ],
                                hoverOffset: 4
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17",
                            "2015/16"
                        ]
                    };

            expect(convertComplexTypeToPiechart(complexData)).to.deep.equal(chartJSData);
        });

        it("should convert complex data to chartJS data, if one value is undefined", () => {
            const complexData =
                    {
                        metadata: {
                            type: "timeseries",
                            format: "YYYY/YY",
                            description: "Anzahl"
                        },
                        values: [
                            {key: "2019/20", value: 372},
                            {key: "2018/19", value: 392},
                            {key: "2017/18", value: 398},
                            {key: "2016/17", value: 381},
                            {key: "2015/16", value: undefined}
                        ]
                    },
                chartJSData =
                    {
                        datasets: [
                            {
                                label: "Anzahl",
                                data: [
                                    372,
                                    392,
                                    398,
                                    381
                                ],
                                backgroundColor: [
                                    "rgba(230, 159, 0, 1)",
                                    "rgba(86, 180, 233, 1)",
                                    "rgba(0, 158, 115, 1)",
                                    "rgba(240, 228, 66, 1)"
                                ],
                                hoverOffset: 4
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17"
                        ]
                    };

            expect(convertComplexTypeToPiechart(complexData)).to.deep.equal(chartJSData);
        });

        it("should convert complex data to chartJS data, if one key is undefined", () => {
            const complexData =
                    {
                        metadata: {
                            type: "timeseries",
                            format: "YYYY/YY",
                            description: "Anzahl"
                        },
                        values: [
                            {key: "2019/20", value: 372},
                            {key: "2018/19", value: 392},
                            {key: "2017/18", value: 398},
                            {key: "2016/17", value: 381},
                            {key: undefined, value: 384}
                        ]
                    },
                chartJSData =
                    {
                        datasets: [
                            {
                                label: "Anzahl",
                                data: [
                                    372,
                                    392,
                                    398,
                                    381
                                ],
                                backgroundColor: [
                                    "rgba(230, 159, 0, 1)",
                                    "rgba(86, 180, 233, 1)",
                                    "rgba(0, 158, 115, 1)",
                                    "rgba(240, 228, 66, 1)"
                                ],
                                hoverOffset: 4
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17"
                        ]
                    };

            expect(convertComplexTypeToPiechart(complexData)).to.deep.equal(chartJSData);
        });

        it("should convert complex data to chartJS data, if label is empty", () => {
            const complexData =
                    {
                        metadata: {
                            type: "timeseries",
                            format: "YYYY/YY",
                            description: ""
                        },
                        values: [
                            {key: "2019/20", value: 372},
                            {key: "2018/19", value: 392},
                            {key: "2017/18", value: 398},
                            {key: "2016/17", value: 381},
                            {key: "2015/16", value: 384}
                        ]
                    },
                chartJSData =
                    {
                        datasets: [
                            {
                                label: "",
                                data: [
                                    372,
                                    392,
                                    398,
                                    381,
                                    384
                                ],
                                backgroundColor: [
                                    "rgba(230, 159, 0, 1)",
                                    "rgba(86, 180, 233, 1)",
                                    "rgba(0, 158, 115, 1)",
                                    "rgba(240, 228, 66, 1)",
                                    "rgba(0, 114, 178, 1)"
                                ],
                                hoverOffset: 4
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17",
                            "2015/16"
                        ]
                    };

            expect(convertComplexTypeToPiechart(complexData)).to.deep.equal(chartJSData);
        });

        it("should convert complex data to chartJS data, if description is undefined", () => {
            const complexData =
                    {
                        metadata: {
                            type: "timeseries",
                            format: "YYYY/YY",
                            description: undefined
                        },
                        values: [
                            {key: "2019/20", value: 372},
                            {key: "2018/19", value: 392},
                            {key: "2017/18", value: 398},
                            {key: "2016/17", value: 381},
                            {key: "2015/16", value: 384}
                        ]
                    },
                chartJSData =
                    {
                        datasets: [
                            {
                                label: "",
                                data: [
                                    372,
                                    392,
                                    398,
                                    381,
                                    384
                                ],
                                backgroundColor: [
                                    "rgba(230, 159, 0, 1)",
                                    "rgba(86, 180, 233, 1)",
                                    "rgba(0, 158, 115, 1)",
                                    "rgba(240, 228, 66, 1)",
                                    "rgba(0, 114, 178, 1)"
                                ],
                                hoverOffset: 4
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17",
                            "2015/16"
                        ]
                    };

            expect(convertComplexTypeToPiechart(complexData)).to.deep.equal(chartJSData);
        });

        it("should return false, if complex data is not complete", () => {
            const complexData =
                {
                    metadata: {
                        type: "timeseries",
                        format: "YYYY/YY",
                        description: "Anzahl"
                    }
                };

            expect(convertComplexTypeToPiechart(complexData)).to.deep.equal(false);
        });

        it("should return a empty object, if complex data is a empty object", () => {
            expect(convertComplexTypeToPiechart({})).to.deep.equal(false);
        });

        it("should return an empty object, if complexData is anything but an object", () => {
            expect(convertComplexTypeToPiechart(undefined)).to.deep.equal(false);
            expect(convertComplexTypeToPiechart(null)).to.deep.equal(false);
            expect(convertComplexTypeToPiechart(1)).to.deep.equal(false);
            expect(convertComplexTypeToPiechart("string")).to.deep.equal(false);
            expect(convertComplexTypeToPiechart(false)).to.deep.equal(false);
            expect(convertComplexTypeToPiechart([])).to.deep.equal(false);
        });

        it("should convert complex data to chartJS data with given background colors, if backgroundColors are given", () => {
            const complexData =
                    {
                        metadata: {
                            type: "timeseries",
                            format: "YYYY/YY",
                            description: "Beschreibung"
                        },
                        values: [
                            {key: "2019/20", value: 372},
                            {key: "2018/19", value: 392},
                            {key: "2017/18", value: 398}
                        ]
                    },
                givenBackgroundColors = [
                    [210, 220, 0, 1],
                    [230, 138, 190, 1],
                    [110, 200, 230, 1]
                ],
                chartJSData =
                    {
                        datasets: [
                            {
                                label: "Beschreibung",
                                data: [
                                    372,
                                    392,
                                    398
                                ],
                                backgroundColor: [
                                    "rgba(210, 220, 0, 1)",
                                    "rgba(230, 138, 190, 1)",
                                    "rgba(110, 200, 230, 1)"
                                ],
                                hoverOffset: 4
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18"
                        ]
                    };

            expect(convertComplexTypeToPiechart(complexData, givenBackgroundColors)).to.deep.equal(chartJSData);
        });
    });

    describe("isComplexType", () => {
        it("should return false if anything but a complexType is given", () => {
            expect(isComplexType(undefined)).to.be.false;
            expect(isComplexType(null)).to.be.false;
            expect(isComplexType("string")).to.be.false;
            expect(isComplexType(1)).to.be.false;
            expect(isComplexType(true)).to.be.false;
            expect(isComplexType(false)).to.be.false;
            expect(isComplexType([])).to.be.false;
            expect(isComplexType({})).to.be.false;
            expect(isComplexType({
                metadata: {
                    type: false,
                    format: "someFormat",
                    description: "someDescription"
                },
                values: []
            })).to.be.false;
            expect(isComplexType({
                metadata: {
                    type: "someType",
                    format: false,
                    description: "someDescription"
                },
                values: []
            })).to.be.false;
            expect(isComplexType({
                metadata: {
                    type: "someType",
                    format: "someFormat",
                    description: false
                },
                values: []
            })).to.be.true;
            expect(isComplexType({
                metadata: {
                    type: "someType",
                    format: "someFormat",
                    description: "someDescription"
                },
                values: {}
            })).to.be.false;
        });

        it("should return true if the given complexType is recognized", () => {
            expect(isComplexType({
                metadata: {
                    type: "someType",
                    format: "someFormat",
                    description: "someDescription"
                },
                values: []
            })).to.be.true;
        });
    });
});
