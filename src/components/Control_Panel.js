import { useRef, useState } from "react";

export default function ControlPanel({  // Props from parent component
    p1On, setP1On,
    tempo, setTempo,
    volume, setVolume,
    reverb, setReverb,
    preprocess, preprocessAndPlay, play, stop,
    downloadSettings, importSettingsFromFile,
    status,
}) {
    const fileRef = useRef(null);  // Ref for hidden file input

    // Effects state
    const [effects, setEffects] = useState({  // Initial effects state
        chorus: false,
        delay: false,
        distortion: false
    });

    // Function to open file chooser dialog
    const onChooseFile = () => fileRef.current?.click();

    // Triggered when user selects a JSON file
    const onFileSelected = (e) => {     // File selection handler
        const f = e.target.files?.[0];  // Get the selected file and ensure it exists
        if (!f) return;                 // Exit if no file selected
        const reader = new FileReader();   // Create a FileReader to read the file
        reader.onload = () => importSettingsFromFile(String(reader.result || ""));  // On load, import settings from file content
        reader.readAsText(f, "utf-8");   // Read file as text
        e.target.value = "";   // Reset input value to allow re-uploading the same file
    };

    // Toggle effect on/off handler
    const toggleEffect = (name) => {
        setEffects(prev => ({ ...prev, [name]: !prev[name] }));   // Toggle the specified effect
    };

    return (
        <div className="control-container">

            {/*playback controls*/}
            <div className="control-section">
                <h3>Playback</h3>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="p1"
                            checked={p1On}
                            onChange={() => setP1On(true)}
                        /> p1: ON
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="p1"
                            checked={!p1On}
                            onChange={() => setP1On(false)}
                        /> p1: HUSH
                    </label>
                </div>

                <div className="button-row">
                    <button id="preprocess" className="btn blue" onClick={preprocess}>Preprocess</button>
                    <button id="process_play" className="btn purple" onClick={preprocessAndPlay}>Proc & Play</button>
                    <button id="play" className="btn green" onClick={play}>▶ Play</button>
                    <button id="stop" className="btn red" onClick={stop}>⏹ Stop</button>
                </div>
            </div>

            {/*Tempo Control*/}
            <div className="control-section">
                <h3>Tempo</h3>
                <div className="tempo-group">
                    <input
                        type="number"
                        value={tempo}
                        onChange={(e) => setTempo(Number(e.target.value))}  // Tempo change handler
                    /> BPM
                </div>
            </div>

            {/*Mixing Controls*/}
            <div className="control-section">
                <h3>Mixing</h3>
                <label>Volume: {volume}%</label>
                <input
                    type="range" min="0" max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                />
                <label>Reverb Intensity: {reverb}%</label>
                <input
                    type="range" min="0" max="100"
                    value={reverb}
                    onChange={(e) => setReverb(Number(e.target.value))}
                />
            </div>

            {/*Effects Controls*/}
            <div className="mb-4">
                <h5 className="text-info">Effects</h5>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={effects.chorus}
                        onChange={() => toggleEffect("chorus")}
                        id="chorus"
                    />
                    <label className="form-check-label" htmlFor="chorus">
                        Chorus
                    </label>
                </div>

                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={effects.delay}
                        onChange={() => toggleEffect("delay")}
                        id="delay"
                    />
                    <label className="form-check-label" htmlFor="delay">
                        Delay
                    </label>
                </div>

                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={effects.distortion}
                        onChange={() => toggleEffect("distortion")}
                        id="distortion"
                    />
                    <label className="form-check-label" htmlFor="distortion">
                        Distortion
                    </label>
                </div>
            </div>


            {/*settings(Import/Export) controls*/}
            <div className="control-section">
                <h3>Settings</h3>
                <div className="button-row">
                    <button id="downloadJsonBtn" className="btn green" onClick={downloadSettings}>Download JSON</button>
                    <button id="uploadJsonBtn" className="btn" onClick={onChooseFile} style={{ background: "#6c63ff" }}>
                        Upload JSON
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/json"
                        onChange={onFileSelected}
                        style={{ display: "none" }}
                    />
                </div>
                {status ? <div style={{ marginTop: 8, opacity: .8, fontSize: 12 }}>{status}</div> : null}
            </div>
        </div>
    );
}
