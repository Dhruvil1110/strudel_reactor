import './App.css';
import { useEffect, useRef, useState } from "react";
import { StrudelMirror } from "@strudel/codemirror";
import { evalScope } from "@strudel/core";
import { drawPianoroll } from "@strudel/draw";
import { transpiler } from "@strudel/transpiler";
import {
    getAudioContext,
    initAudioOnFirstClick,
    registerSynthSounds,
    webaudioOutput,
} from "@strudel/webaudio";
import { registerSoundfonts } from "@strudel/soundfonts";
import { stranger_tune } from './tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';

import {
    processAndLoad,
    applySettingsObject,
    downloadSettings,
    importSettingsFromFile
} from "./components/Settings";


import Preprocessor_Editor from './components/Preprocessor_Editor';
import Control_Panel from './components/Control_Panel';
import Graph from './components/Graph';

export let globalEditor = null;

// Handler for custom D3 data event
const handleD3Data = (event) => {   
    console.log(event.detail);
};



export async function resumeAudio() { // Ensure audio context is running
    initAudioOnFirstClick();         // Init on first click
    const ac = getAudioContext();    // Get audio context
    if (ac && ac.state !== "running") await ac.resume();  // Resume if not running
}

export async function stopAudio() {   // Stop playback and suspend audio context
    try {                                    // Try-catch for error handling
        globalEditor?.stop?.();              // Stop editor evaluation
        globalEditor?.repl?.stop?.();        // Stop REPL playback
        globalEditor?.repl?.scheduler?.stop?.();     // Stop scheduler if exists
         
        const ac = getAudioContext();        // Get audio context
        if (ac && ac.state !== "suspended") await ac.suspend();  // Suspend audio context if not already
    } catch (e) {
        console.error("Stop error:", e);    // Log any errors
    }
}
export default function StrudelDemo() {   

    const hasRun = useRef(false);

    // App states: text, playback controls, and mixer settings
    const [text, setText] = useState(stranger_tune);  // Editor text state
    const [p1On, setP1On] = useState(true);     // p1 playback control
    const [tempo, setTempo] = useState(120);    // Default tempo
    const [volume, setVolume] = useState(50);   // Default volume
    const [reverb, setReverb] = useState(40);   // Default reverb
    const [status, setStatus] = useState("");   // Status message state

    // Notification popup state
    const [popupMsg, setPopupMsg] = useState("");  

    // Function to show popup notification
    const showPopup = (msg) => {
        setPopupMsg(msg);        // Set popup message  
        setTimeout(() => setPopupMsg(""), 5000);  // Clear after 5 seconds
    };

useEffect(() => {

    if (hasRun.current) return; // prevent re-running setup
    document.addEventListener("d3Data", handleD3Data);   // Listen for custom D3 data events
    console_monkey_patch();

        hasRun.current = true;
        //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
            //init canvas

    const canvas = document.getElementById("roll");
    canvas.width = canvas.width * 2;
    canvas.height = canvas.height * 2;

    const ctx = canvas.getContext("2d");
    const drawTime = [-2, 2];

    globalEditor = new StrudelMirror({
        defaultOutput: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
        transpiler,
        root: document.getElementById("output-panel"),
        drawTime,
        onDraw: (haps, time) =>
            drawPianoroll({ haps, time, ctx, drawTime, fold: 0 }),

        prebake: async () => {
            initAudioOnFirstClick();
            const loadModules = evalScope(
                import("@strudel/core"),
                import("@strudel/draw"),
                import("@strudel/mini"),
                import("@strudel/tonal"),
                import("@strudel/webaudio")
            );
            await Promise.all([
                loadModules,
                registerSynthSounds(),
                registerSoundfonts(),
            ]);
        },
    });

    processAndLoad(stranger_tune, p1On);  // Initial processing and loading
}, [p1On]);   // Re-run if p1On changes

useEffect(() => {

        const handleHotkeys = (e) => {

            // Key 1 to Play song
            if (e.key === "1") { 
                e.preventDefault();     // Prevent default action
                document.getElementById("play")?.click();  // Trigger play button
                showPopup("Hotkey 1: Play");      // Show popup
            }

            // Key 2 to stop song
            if (e.key === "2") { 
                e.preventDefault();   
                document.getElementById("stop")?.click();  // Trigger stop button
                showPopup("Hotkey 2: Stopped Playback");   // Show popup
            }

            // Key 3 to Proc & Play
            if (e.key === "3") {
                e.preventDefault();
                document.getElementById("process_play")?.click();  // Trigger Proc & Play button
                showPopup("Hotkey 3: Proc & Play");    // Show popup
            }

            // P for Preprocess
            if (e.key === "4") {
                document.getElementById("preprocess")?.click();  // Trigger Preprocess button
                showPopup("Hotkey 4: Preprocess");   // Show popup
            }

            // D for Download JSON
            if (e.key.toLowerCase() === "d") {
                e.preventDefault();
                document.getElementById("downloadJsonBtn")?.click();  // Trigger download button
                showPopup("Download Settings");      // Show popup
            }

            // U for Load JSON
            if (e.key.toLowerCase() === "u") {
                e.preventDefault();
                document.getElementById("uploadJsonBtn")?.click();  // Trigger upload button
                showPopup("Upload Settings");     // Show popup
            }
        };

        window.addEventListener("keydown", handleHotkeys);   // Attach listener
        return () => window.removeEventListener("keydown", handleHotkeys);   // return cleanup 

}, []);

    // Function tempo 
    const applyTempo = (code, bpm) => {
        // Regex to find existing tempo line
        const tempoLineRegex = /^setcps\(.*?\)/m;
        // Create new tempo line
        const newLine = `setcps(${bpm}/60/4)`;
        // If tempo line exists, replace it
        if (tempoLineRegex.test(code)) {
            return code.replace(tempoLineRegex, newLine);  // Replace existing line and return
        }
        
        return `${newLine}\n${code}`; // Else, add it at the top
    };

    // Handler for tempo changes
    const onTempoChange = async (bpm) => {
        setTempo(bpm);   // Update state

        let newScript = applyTempo(text, bpm); // Modify script
        setText(newScript);    // Update editor text

        await resumeAudio();        // Ensure audio context is active
        processAndLoad(newScript, p1On);   // Reprocess with new tempo
        globalEditor?.evaluate();
        setStatus("Tempo Updated & Playing");  // Update status
    };

return (
    <div className="dark-page">
        <header className="dark-header">
            <h1>Strudel Preprocessor Studio</h1>
        </header>

        <main className="dark-grid">
            <section className="dark-card editor-card">
                <h2 className="title accent-blue">Preprocessor Editor</h2>
                <Preprocessor_Editor value={text} onChange={setText} />  
            </section>

            <section className="dark-card output-card">
                <h2 className="title accent-purple">Strudel REPL Output</h2>
                <div id="output-panel" className="output-live" />
            </section>

            <section className="dark-card control-card">
                <h2 className="title accent-cyan">Control Panel</h2>
                {/* POPUP NOTIFICATION */}
                    {popupMsg && (
                        <div className="popup-alert">
                            {popupMsg}
                        </div>
                    )}
                <Control_Panel  
                    p1On={p1On} setP1On={setP1On}  
                    tempo={tempo} setTempo={onTempoChange}
                    volume={volume} setVolume={setVolume}
                    reverb={reverb} setReverb={setReverb}
                    preprocess={() => processAndLoad(text, p1On)}   // Preprocess button handler
                    preprocessAndPlay={async () => { await resumeAudio(); processAndLoad(text, p1On); globalEditor?.evaluate(); setStatus("Playing (proc)"); }}  // Preprocess & Play button handler
                    play={async () => { await resumeAudio(); globalEditor?.evaluate(); setStatus("Playing"); }}   // Play button handler
                    stop={stopAudio}       // Stop button handler
                    downloadSettings={() => downloadSettings(tempo, volume, reverb, p1On, text, setStatus)}   // Download settings handler
                    importSettingsFromFile={(fileContent) => importSettingsFromFile(fileContent, setTempo, setVolume, setReverb, setP1On, setText, setStatus)}   // Import settings handler 
                    status={status}   // Status message display
                />
            </section>

            <section className="dark-card graph-card">
                <h2 className="title accent-green">D3 Graph</h2>    
                <Graph />
            </section>
        </main>

        <canvas id="roll" width="600" height="120" style={{ display: "none" }} />
    </div>

);


}