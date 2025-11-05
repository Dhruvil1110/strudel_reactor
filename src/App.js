import './App.css';
import { useEffect, useRef, useState } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';

import Preprocessor_Editor from './components/Preprocessor_Editor';
import Control_Panel from './components/Control_Panel';
import Graph from './components/Graph';

let globalEditor = null;

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
export function processAndLoad(txt, p1On) {
    const replaced = txt.replaceAll("<p1_Radio>", p1On ? "" : "_");
    if (globalEditor) globalEditor.setCode(replaced);
}

// Export function to resume audio playback
export async function resumeAudio() {
    initAudioOnFirstClick();
    const ac = getAudioContext();
    if (ac && ac.state !== "running") await ac.resume();
}

// Export function to stop the audio and editor
export async function stopAudio() {
    try {
        if (globalEditor?.stop) globalEditor.stop();
        if (globalEditor?.repl?.stop) globalEditor.repl.stop();
        if (globalEditor?.repl?.scheduler?.stop) globalEditor.repl.scheduler.stop();
        const ac = getAudioContext();
        if (ac && ac.state !== "suspended") await ac.suspend(); // hard stop
    } catch (e) {
        console.error(e);
    }
}

// apply settings from imported JSON
export function applySettingsObject(obj, setTempo, setVolume, setReverb, setP1On, setText, setStatus) {
    setTempo(Number(obj.tempo ?? 120));
    setVolume(Number(obj.volume ?? 50));
    setReverb(Number(obj.reverb ?? 40));
    setP1On(Boolean(obj.p1On));
    if (typeof obj.text === "string") setText(obj.text);
    processAndLoad(obj.text || "", obj.p1On);
}

// download settings as JSON file
export function downloadSettings(tempo, volume, reverb, p1On, text, setStatus) {
    const data = { tempo, volume, reverb, p1On, text };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "strudel-settings.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("Settings downloaded");
}

// import settings from JSON file
export function importSettingsFromFile(jsonString, setTempo, setVolume, setReverb, setP1On, setText, setStatus) {
    try {
        const obj = JSON.parse(jsonString);
        applySettingsObject(obj, setTempo, setVolume, setReverb, setP1On, setText, setStatus);
        setStatus("Settings imported from file");
    } catch {
        setStatus("Invalid settings file");
    }
}

export default function StrudelDemo() {

    const hasRun = useRef(false);

    const [text, setText] = useState(stranger_tune);
    const [p1On, setP1On] = useState(true);
    const [tempo, setTempo] = useState(120);
    const [volume, setVolume] = useState(50);
    const [reverb, setReverb] = useState(40);
    const [status, setStatus] = useState("");

useEffect(() => {

    if (hasRun.current) return;
        //document.addEventListener("d3Data", handleD3Data);
        console_monkey_patch();
        hasRun.current = true;
        //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
            //init canvas
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2]; // time window of drawn haps
            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: document.getElementById('output-panel'),
                drawTime,
                onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
                prebake: async () => {
                    initAudioOnFirstClick(); // needed to make the browser happy (don't await this here..)
                    const loadModules = evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio'),
                    );
                    await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                },
            });
            
    processAndLoad(stranger_tune, p1On);

}, [p1On]);


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