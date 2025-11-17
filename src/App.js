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

//const handleD3Data = (event) => {
//    console.log(event.detail);
//};

//export function SetupButtons() {

//    document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
//    document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
//    document.getElementById('process').addEventListener('click', () => {
//        Proc()
//    }
//    )
//    document.getElementById('process_play').addEventListener('click', () => {
//        if (globalEditor != null) {
//            Proc()
//            globalEditor.evaluate()
//        }
//    }
//    )
//}



//export function ProcAndPlay() {
//    if (globalEditor != null && globalEditor.repl.state.started == true) {
//        console.log(globalEditor)
//        Proc()
//        globalEditor.evaluate();
//    }
//}

//export function Proc() {

//    let proc_text = document.getElementById('proc').value
//    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
//    ProcessText(proc_text);
//    globalEditor.setCode(proc_text_replaced)
//}

//export function ProcessText(match, ...args) {

//    let replace = ""
//    if (document.getElementById('flexRadioDefault2').checked) {
//        replace = "_"
//    }

//    return replace
//}

// Export function to process and load text into the Strudel editor

export async function resumeAudio() {
    initAudioOnFirstClick();
    const ac = getAudioContext();
    if (ac && ac.state !== "running") await ac.resume();
}

export async function stopAudio() {
    try {
        globalEditor?.stop?.();
        globalEditor?.repl?.stop?.();
        globalEditor?.repl?.scheduler?.stop?.();

        const ac = getAudioContext();
        if (ac && ac.state !== "suspended") await ac.suspend();
    } catch (e) {
        console.error("Stop error:", e);
    }
}
export default function StrudelDemo() {

    const hasRun = useRef(false);

    // App states: text, playback controls, and mixer settings
    const [text, setText] = useState(stranger_tune);
    const [p1On, setP1On] = useState(true);
    const [tempo, setTempo] = useState(120);
    const [volume, setVolume] = useState(50);
    const [reverb, setReverb] = useState(40);
    const [status, setStatus] = useState("");

    // NEW: Notification popup state
    const [popupMsg, setPopupMsg] = useState("");

    const showPopup = (msg) => {
        setPopupMsg(msg);
        setTimeout(() => setPopupMsg(""), 5000); // auto-hide
    };

useEffect(() => {

    if (hasRun.current) return; // prevent re-running setup
        //document.addEventListener("d3Data", handleD3Data);
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

    processAndLoad(stranger_tune, p1On);
}, [p1On]);

useEffect(() => {

        const handleHotkeys = (e) => {

            // Space = Play
            if (e.key === "1") {
                e.preventDefault();
                document.getElementById("play")?.click();
                showPopup("▶ Hotkey 1: Play");
            }

            // Shift + Space = Stop
            if (e.key === "2") {
                e.preventDefault();
                document.getElementById("stop")?.click();
                showPopup("⏹ Hotkey 2: Stopped Playback");
            }

            // Enter = Proc & Play
            if (e.key === "3") {
                e.preventDefault();
                document.getElementById("process_play")?.click();
                showPopup("⚙️ Hotkey 3: Proc & Play");
            }

            // P = Preprocess
            if (e.key === "4") {
                document.getElementById("preprocess")?.click();
                showPopup("🔧 Hotkey 4: Preprocess");
            }

            // D = Download JSON
            if (e.key.toLowerCase() === "d") {
                e.preventDefault();
                document.getElementById("downloadJsonBtn")?.click();
                showPopup("💾 Download Settings");
            }

            // U = Load JSON
            if (e.key.toLowerCase() === "u") {
                e.preventDefault();
                document.getElementById("uploadJsonBtn")?.click();
                showPopup("📂 Upload Settings");
            }
        };

        window.addEventListener("keydown", handleHotkeys);
        return () => window.removeEventListener("keydown", handleHotkeys);

    }, []);

return (
    <div className="dark-page">
        <header className="dark-header">
            <h1>🎧 Strudel Preprocessor Studio</h1>
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
                    tempo={tempo} setTempo={setTempo}
                    volume={volume} setVolume={setVolume}
                    reverb={reverb} setReverb={setReverb}
                    preprocess={() => processAndLoad(text, p1On)}  
                    preprocessAndPlay={async () => { await resumeAudio(); processAndLoad(text, p1On); globalEditor?.evaluate(); setStatus("Playing (proc)"); }}
                    play={async () => { await resumeAudio(); globalEditor?.evaluate(); setStatus("Playing"); }}
                    stop={stopAudio}
                    downloadSettings={() => downloadSettings(tempo, volume, reverb, p1On, text, setStatus)}
                    importSettingsFromFile={(fileContent) => importSettingsFromFile(fileContent, setTempo, setVolume, setReverb, setP1On, setText, setStatus)}
                    status={status}
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