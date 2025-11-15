import { getAudioContext, initAudioOnFirstClick } from "@strudel/webaudio";
import { globalEditor } from "../components/StrudelEngine";

// Export function to resume audio playback
export async function resumeAudio() {
    initAudioOnFirstClick();   // ensure audio context is initialized
    const ac = getAudioContext();    // get the audio context
    if (ac && ac.state !== "running") await ac.resume();   // resume if not already running
}

// Export function to stop the audio and editor
export async function stopAudio() {
    try {
        globalEditor?.stop?.();
        globalEditor?.repl?.stop?.();

        const scheduler = globalEditor?.repl?.scheduler;
        if (scheduler?.stop) scheduler.stop();

        const ac = getAudioContext();   // Get the Audio context and suspend it to stop all sounds completely.
        if (ac && ac.state !== "suspended") await ac.suspend();
    } catch (e) {
        console.error(e);
    }
}
