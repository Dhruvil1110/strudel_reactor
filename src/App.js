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

export function processAndLoad(txt, p1On) {
    const replaced = txt.replaceAll("<p1_Radio>", p1On ? "" : "_");
    if (globalEditor) globalEditor.setCode(replaced);
}


export async function resumeAudio() {
    initAudioOnFirstClick();
    const ac = getAudioContext();
    if (ac && ac.state !== "running") await ac.resume();
}


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


export default function StrudelDemo() {

    const hasRun = useRef(false);

    const [text, setText] = useState(stranger_tune);
    const [p1On, setP1On] = useState(true);

useEffect(() => {

    if (!hasRun.current) return;
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
                root: document.getElementById('editor'),
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


        </main>

        <canvas id="roll" width="600" height="120" style={{ display: "none" }} />
    </div>

);


}