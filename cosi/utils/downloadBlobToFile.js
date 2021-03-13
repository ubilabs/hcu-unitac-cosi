/** */
export default function downloadBlobToFile (blob, filename) {
    const link = document.createElement("a"),
        url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
