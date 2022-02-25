/**
 * Loads the specified JS and calls the given callback after the file has loaded. Modifies the DOM for loading.
 * @param {String} fileName - The URL to Load
 * @param {Function} callback - the Function to call after loading has completed
 * @returns {undefined}
 */
function loadPackage (fileName, callback) {
    const head = document.getElementsByTagName("head")[0],
        script = document.createElement("script");

    script.type = "text/javascript";
    script.src = fileName;

    script.onload = callback;
    script.onreadystatechange = function () {
        if (this.readyState === "complete") {
            return callback();
        }
        return null;
    };
    head.appendChild(script);
}
export default function loadPackages (streetsmartAPIVersion, reactVersion) {
    const urlStreetsmartAPI = `https://streetsmart.cyclomedia.com/api/${streetsmartAPIVersion}/StreetSmartApi.js`,
        urlReact = `https://unpkg.com/react@${reactVersion}/umd/react.production.min.js`,
        urlReactDom = `https://unpkg.com/react-dom@${reactVersion}/umd/react-dom.production.min.js`;

    try {
        loadPackage(urlReact,
            function () {
                loadPackage(urlReactDom,
                    function () {
                        loadPackage(urlStreetsmartAPI);
                    });
            });


    }
    catch (err) {
        console.error("loading of package failed:", err);
    }
}
