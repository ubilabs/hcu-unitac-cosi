const sortArrays = {
    sortDwellTimeArray: (arr) => {
        // eslint-disable-next-line
        const numericalOrder = (range) => {
            if (range.includes("+")) {
                return Infinity;
            }
            const [min, max] = range.split("-");

            return (Number(min) + Number(max)) / 2;
        };

        arr.sort((a, b) => numericalOrder(a) - numericalOrder(b));

        return arr;
    },
    sortAgeGroupsArray: (arr) => {
        // eslint-disable-next-line
        const numericalOrder = (range) => {
            if (range.includes(">")) {
                return parseInt(range.slice(1), 10) + 1;
            }
            const [min, max] = range.slice(1, -1).split("-");

            return (Number(min) + Number(max)) / 2;
        };
        // eslint-disable-next-line
        arr = arr.map((range) => range.replace(/[[\]]/g, "")); // Remove brackets
        arr.sort((a, b) => numericalOrder(a) - numericalOrder(b));

        return arr;
    }
};

export default sortArrays;
