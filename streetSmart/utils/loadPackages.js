/**
 * Loads a JavaScript file and returns a Promise for when it is loaded
 * @param {String} src the URL to Load
 * @returns {void}
 */
function loadPackage (src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.type = "text/javascript";
        script.onload = resolve;
        script.onerror = reject;
        script.src = src;
        document.head.append(script);
    });
}
/**
 * Loads StreetSmartApi and react in the given versions. They are loaded by appending a script tag to head tag and not by package.json.
 * React is loaded this way, because only the production version works with StreetSmartApi.
 * StreetSmartApi is loaded this way, because it is not a npm package.
 * @param {String} streetsmartAPIVersion version of the StreetSmartApi
 * @param {String} reactVersion  version of react
 * @param {Function} callback  called, if all libs are loaded
 * @returns {void}
 */
export default async function loadPackages (streetsmartAPIVersion, reactVersion, callback) {
    const urlStreetsmartAPI = `https://streetsmart.cyclomedia.com/api/${streetsmartAPIVersion}/StreetSmartApi.js`,
        urlReact = `https://unpkg.com/react@${reactVersion}/umd/react.production.min.js`,
        urlReactDom = `https://unpkg.com/react-dom@${reactVersion}/umd/react-dom.production.min.js`;

    try {
        loadPackage(urlReact)
            .then(() => loadPackage(urlReactDom))
            .then(() => loadPackage(urlStreetsmartAPI))
            .then(() => {
                if (callback) {
                    return callback();
                }
                return null;
            })
            .catch((err) => console.error("loading of package failed:", err));
    }
    catch (err) {
        console.error("loading of package failed:", err);
    }
}
