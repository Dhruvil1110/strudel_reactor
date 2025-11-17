import { globalEditor } from "../App";

export function processAndLoad(txt, p1On) {
    // Replace every <p1_Radio> tag with an underscore or nothing, depending on whether p1On is false or true.
    const replaced = txt.replaceAll("<p1_Radio>", p1On ? "" : "_");
    if (globalEditor) globalEditor.setCode(replaced);   // update its code with the processed text.
}

// apply settings from imported JSON
export function applySettingsObject(obj, setTempo, setVolume, setReverb, setP1On, setText, setStatus) {
    // set each setting with a fallback default value
    setTempo(Number(obj.tempo ?? 120));
    setVolume(Number(obj.volume ?? 50));
    setReverb(Number(obj.reverb ?? 40));
    setP1On(Boolean(obj.p1On));

    if (typeof obj.text === "string") setText(obj.text); // only set text if it's a string
    processAndLoad(obj.text || "", obj.p1On);      // process and load the text into the editor

    setStatus("Settings imported");
}

// download settings as JSON file
export function downloadSettings(tempo, volume, reverb, p1On, text, setStatus) {
    const data = { tempo, volume, reverb, p1On, text };
    // Convert the object into a JSON blob for download.
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const a = document.createElement("a");   // create a temporary anchor element
    a.href = URL.createObjectURL(blob);      // create a URL for the blob
    a.download = "strudel-settings.json";    // set the download filename
    a.click();                               // trigger the download
    URL.revokeObjectURL(a.href);             // clean up the URL object

    setStatus("Settings downloaded");        // update status
}

// import settings from JSON file
export function importSettingsFromFile(jsonString, setTempo, setVolume, setReverb, setP1On, setText, setStatus) {
    try {
        // Parse the JSON string into an object
        const obj = JSON.parse(jsonString);
        applySettingsObject(obj, setTempo, setVolume, setReverb, setP1On, setText, setStatus);
        setStatus("Settings imported from file"); // update status
    } catch {
        setStatus("Invalid settings file");  // error handling
    }
}
