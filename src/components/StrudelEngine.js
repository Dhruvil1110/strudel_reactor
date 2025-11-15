import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';

export let globalEditor = null;

export function initEditor(p1On, stranger_tune, processAndLoad, console_patch) {
    console_patch();

    const canvas = document.getElementById('roll');
    canvas.width = canvas.width * 2;
    canvas.height = canvas.height * 2;

    const ctx = canvas.getContext('2d');
    const drawTime = [-2, 2];     // time window of drawn haps

    globalEditor = new StrudelMirror({
        defaultOutput: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
        transpiler,
        root: document.getElementById('output-panel'),   // target output area
        drawTime,
        onDraw: (haps, time) =>
            drawPianoroll({ haps, time, ctx, drawTime, fold: 0 }),

        prebake: async () => {
            initAudioOnFirstClick();    // needed to make the browser happy (don't await this here..)
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

    processAndLoad(stranger_tune, p1On);    // Load initial Strudel code into the editor
}
