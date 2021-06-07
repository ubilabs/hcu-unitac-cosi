import {expect} from "chai";
import {
    convertComplexTypeToPiechart,
    convertComplexTypeToBarchart,
    isComplexType,
    sortComplexType
} from "../../../utils/complexType.js";

describe("addons/utils/complexType.js", () => {
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

            expect(convertComplexTypeToPiechart(complexData)).to.be.false;
        });

        it("should return false, if complex data is a empty object", () => {
            expect(convertComplexTypeToPiechart({})).to.be.false;
        });

        it("should return false, if complexData is anything but an object", () => {
            expect(convertComplexTypeToPiechart(undefined)).to.be.false;
            expect(convertComplexTypeToPiechart(null)).to.be.false;
            expect(convertComplexTypeToPiechart(1)).to.be.false;
            expect(convertComplexTypeToPiechart("string")).to.be.false;
            expect(convertComplexTypeToPiechart(false)).to.be.false;
            expect(convertComplexTypeToPiechart([])).to.be.false;
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

    describe("convertComplexTypeToBarchart", () => {
        it("should convert complex data to bar chartJS data", () => {
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
                                backgroundColor: "rgba(0, 92, 169, 1)",
                                hoverBackgroundColor: "rgba(225, 0, 25, 1)",
                                borderWidth: 1
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

            expect(convertComplexTypeToBarchart(complexData)).to.deep.equal(chartJSData);
        });

        it("should convert complex data to chartJS data with a gap in the dataset, if one value is undefined", () => {
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
                                    381,
                                    undefined
                                ],
                                backgroundColor: "rgba(0, 92, 169, 1)",
                                hoverBackgroundColor: "rgba(225, 0, 25, 1)",
                                borderWidth: 1
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

            expect(convertComplexTypeToBarchart(complexData)).to.deep.equal(chartJSData);
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
                                backgroundColor: "rgba(0, 92, 169, 1)",
                                hoverBackgroundColor: "rgba(225, 0, 25, 1)",
                                borderWidth: 1
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17"
                        ]
                    };

            expect(convertComplexTypeToBarchart(complexData)).to.deep.equal(chartJSData);
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
                            {key: "2016/16", value: 384}
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
                                backgroundColor: "rgba(0, 92, 169, 1)",
                                hoverBackgroundColor: "rgba(225, 0, 25, 1)",
                                borderWidth: 1
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17",
                            "2016/16"
                        ]
                    };

            expect(convertComplexTypeToBarchart(complexData)).to.deep.equal(chartJSData);
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
                            {key: "2016/16", value: 384}
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
                                backgroundColor: "rgba(0, 92, 169, 1)",
                                hoverBackgroundColor: "rgba(225, 0, 25, 1)",
                                borderWidth: 1
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18",
                            "2016/17",
                            "2016/16"
                        ]
                    };

            expect(convertComplexTypeToBarchart(complexData)).to.deep.equal(chartJSData);
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

            expect(convertComplexTypeToBarchart(complexData)).to.be.false;
        });

        it("should return false, if complex data is a empty object", () => {
            expect(convertComplexTypeToBarchart({})).to.be.false;
        });

        it("should return an empty object, if complexData is anything but an object", () => {
            expect(convertComplexTypeToBarchart(undefined)).to.be.false;
            expect(convertComplexTypeToBarchart(null)).to.be.false;
            expect(convertComplexTypeToBarchart(1)).to.be.false;
            expect(convertComplexTypeToBarchart("string")).to.be.false;
            expect(convertComplexTypeToBarchart(false)).to.be.false;
            expect(convertComplexTypeToBarchart([])).to.be.false;
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
                givenBackgroundColor = [210, 220, 0, 1],
                givenHoverBackgroundColor = [0, 92, 255, 1],
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
                                backgroundColor: "rgba(210, 220, 0, 1)",
                                hoverBackgroundColor: "rgba(0, 92, 255, 1)",
                                borderWidth: 1
                            }
                        ],
                        labels: [
                            "2019/20",
                            "2018/19",
                            "2017/18"
                        ]
                    };

            expect(convertComplexTypeToBarchart(complexData, givenBackgroundColor, givenHoverBackgroundColor)).to.deep.equal(chartJSData);
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

    describe("sortComplexType", () => {
        it("should return false if the given complex type is not a complex type", () => {
            expect(sortComplexType(undefined)).to.be.false;
            expect(sortComplexType(null)).to.be.false;
            expect(sortComplexType("string")).to.be.false;
            expect(sortComplexType(1)).to.be.false;
            expect(sortComplexType(true)).to.be.false;
            expect(sortComplexType(false)).to.be.false;
            expect(sortComplexType([])).to.be.false;
            expect(sortComplexType({})).to.be.false;
            expect(sortComplexType({
                metadata: {}, values: []
            })).to.be.false;
        });
        it("should sort the given complex type by key ascending by default for a timeseries", () => {
            const complexType = {
                    metadata: {
                        type: "timeseries",
                        format: "DD.MM.YYYY, HH:mm",
                        description: ""
                    },
                    values: [
                        {key: "11.05.2021, 17:00", value: 1},
                        {key: "12.04.2021, 18:00", value: 2},
                        {key: "10.06.2021, 17:48", value: 3}
                    ]
                },
                expected = {
                    metadata: {
                        type: "timeseries",
                        format: "DD.MM.YYYY, HH:mm",
                        description: ""
                    },
                    values: [
                        {key: "12.04.2021, 18:00", value: 2},
                        {key: "11.05.2021, 17:00", value: 1},
                        {key: "10.06.2021, 17:48", value: 3}
                    ]
                };

            expect(sortComplexType(complexType)).to.deep.equal(expected);
        });
        it("should sort the given complex type by key ascending by default for an unknown type", () => {
            const complexType = {
                    metadata: {
                        type: "unknownType",
                        format: "DD.MM.YYYY, HH:mm",
                        description: ""
                    },
                    values: [
                        {key: "11.05.2021, 17:00", value: 1},
                        {key: "12.04.2021, 18:00", value: 2},
                        {key: "10.06.2021, 17:48", value: 3}
                    ]
                },
                expected = {
                    metadata: {
                        type: "unknownType",
                        format: "DD.MM.YYYY, HH:mm",
                        description: ""
                    },
                    values: [
                        {key: "10.06.2021, 17:48", value: 3},
                        {key: "11.05.2021, 17:00", value: 1},
                        {key: "12.04.2021, 18:00", value: 2}
                    ]
                };

            expect(sortComplexType(complexType)).to.deep.equal(expected);
        });
        it("should sort the given complex type with the given compare function", () => {
            const complexType = {
                    metadata: {
                        type: "something",
                        format: "someFormat",
                        description: ""
                    },
                    values: [
                        {key: "high", value: 2},
                        {key: "low", value: 1},
                        {key: "mid", value: 3}
                    ]
                },
                expected = {
                    metadata: {
                        type: "something",
                        format: "someFormat",
                        description: ""
                    },
                    values: [
                        {key: "low", value: 1},
                        {key: "mid", value: 3},
                        {key: "high", value: 2}
                    ]
                },
                functionHelper = {
                    compareFunction: (a, b) => {
                        if (a.key === "low" && b.key !== "low") {
                            return -1;
                        }
                        else if (b.key === "low" && a.key !== "low") {
                            return 1;
                        }
                        else if (a.key === "mid" && b.key !== "mid") {
                            return -1;
                        }
                        else if (b.key === "mid" && a.key !== "mid") {
                            return 1;
                        }
                        return 1;
                    }
                };

            expect(sortComplexType(complexType, functionHelper.compareFunction)).to.deep.equal(expected);
        });
        it("should put an unknown key into the list as the lowest entry", () => {
            const complexType = {
                    metadata: {
                        type: "timeseries",
                        format: "DD.MM.YYYY, HH:mm",
                        description: ""
                    },
                    values: [
                        {key: undefined, value: 1},
                        {key: "12.04.2021, 18:00", value: 2},
                        {key: "10.06.2021, 17:48", value: 3}
                    ]
                },
                expected = {
                    metadata: {
                        type: "timeseries",
                        format: "DD.MM.YYYY, HH:mm",
                        description: ""
                    },
                    values: [
                        {key: undefined, value: 1},
                        {key: "12.04.2021, 18:00", value: 2},
                        {key: "10.06.2021, 17:48", value: 3}
                    ]
                };

            expect(sortComplexType(complexType)).to.deep.equal(expected);
        });
    });
});
