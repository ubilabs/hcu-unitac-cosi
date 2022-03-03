/**
 * Loads the specified JS and calls the given callback after the file has loaded. Modifies the DOM for loading.
 * @param {String} fileName the URL to Load
 * @param {Function} callback the Function to call after loading has completed
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
/**
 * Loads StreetSmartApi and react in the given versions. They are loaded by appending a script tag to head tag and not by package.json.
 * React is loaded this way, because only the production version works with StreetSmartApi.
 * StreetSmartApi is loaded this way, because it is not a npm package.
 * @param {String} streetsmartAPIVersion version of the StreetSmartApi
 * @param {String} reactVersion  version of react
 * @returns {void}
 */
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
