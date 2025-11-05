import { useRef } from "react";

export default function ControlPanel({
    p1On, setP1On,
    tempo, setTempo,
    volume, setVolume,
    reverb, setReverb,
    preprocess, preprocessAndPlay, play, stop,
    downloadSettings, importSettingsFromFile,
    status,
}) {
    const fileRef = useRef(null);

    const onChooseFile = () => fileRef.current?.click();

    const onFileSelected = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => importSettingsFromFile(String(reader.result || ""));
        reader.readAsText(f, "utf-8");
        e.target.value = ""; 
    };

    return (
        <div className="control-container">
            
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
                    <button className="btn blue" onClick={preprocess}>Preprocess</button>
                    <button className="btn purple" onClick={preprocessAndPlay}>Proc & Play</button>
                    <button className="btn green" onClick={play}>▶ Play</button>
                    <button className="btn red" onClick={stop}>⏹ Stop</button>
                </div>
            </div>

            
            <div className="control-section">
                <h3>Tempo</h3>
                <div className="tempo-group">
                    <input
                        type="number"
                        value={tempo}
                        onChange={(e) => setTempo(Number(e.target.value))}
                    /> BPM
                </div>
            </div>

            
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

            
            <div className="control-section">
                <h3>Settings</h3>
                <div className="button-row">
                    <button className="btn green" onClick={downloadSettings}>Download JSON</button>
                    <button className="btn" onClick={onChooseFile} style={{ background: "#6c63ff" }}>
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
