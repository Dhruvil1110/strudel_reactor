# Strudel Preprocessor Studio - README

## Overview

This project is a live-coding interface and Strudel music preprocessor built on React.  
Users can modify Strudel code, preprocess it, play it, change settings, import and export configuration, and use a piano-roll canvas and D3 graph to visualize activity.

The interface includes:
- Preprocessor Editor  
- Strudel REPL Output  
- Control Panel (Playback, Tempo, Mixing, Effects, Settings)  
- D3 Graph Visualizer  

# 1. Preprocessor Editor
The Preprocessor Editor is where users write and modify Strudel code.

### Features
- Editable textarea bound to React state.
- The code is updated in real time, but it doesn't run until it is preprocessed or played back.
- Recognizes <p1_Radio> tags in order to perform conditional playback.
- Integrated with processAndLoad().

### Behavior
- Text is controlled via props.
- Depending on the p1 ON/HUSH state, preprocessing replaces an underscore or empty text for <p1_Radio>.

# 2. Strudel REPL Output
Rendered in the element with ID output-panel.

### Purpose
- Displays processed Strudel output.
- Shows real-time evaluation logs.
- The piano-roll visualization is created via StrudelMirror's rendering pipeline using the hidden canvas id="roll". 

# 3. Control Panel
Contains all user interactions for playback, tempo, mixing, effects, and settings.

## 3.1 Playback Controls

- p1: ON / p1: HUSH - Toggles whether <p1_Radio> sections in code are active. 
- Preprocess - Processes the script without playback. 
- Proc & Play - Preprocesses and automatically starts playback. 
- Play - Plays the current code without preprocessing. 
- Stop - Stops Strudel playback and suspends audio context. 

### Notes

- Make use of the StrudelMirror.evaluate() in order to playback.
- .stop() and audio context suspension are used to stop audio.

## 3.2 Tempo Control

- The setcps(bpm/60/4) line in the script is rewritten when the BPM is changed.
- The project automatically reprocesses and plays after the update.
- Ensures audio context is resumed before playback.

## 3.3 Mixing Controls

- Volume: Sets stored volume value. 
- Reverb Intensity: Sets stored reverb value. 

These values are exported/imported with settings.

## 3.4 Effects Section

Three available toggles:
- Chorus  
- Delay  
- Distortion  

These values exist only in component state and are not applied to audio output.

## 3.5 Settings (Import/Export)

### Download JSON
Exports:
- tempo  
- volume  
- reverb  
- p1On state  
- full text from Preprocessor Editor  

### Upload JSON
Restores:
- tempo  
- volume  
- reverb  
- p1On  
- Strudel code  
- Automatically loads script into Strudel engine  

# 4. Hotkeys  

- 1: Play
- 2: Stop 
- 3: Proc & Play 
- 4: Preprocess 
- D: Download JSON 
- U: Upload JSON 

- For five seconds, a popup window appears on the screen when each hotkey triggers the corresponding button click.

# 5. D3 Graph  

### Features
- Renders axes with a dark theme (0–50 X, 0–30 Y).
- Redraws and clears the component mount.
- Subscribes to special d3Data events that the patched console generates.
- Provides a container for real-time visualization.

### Current Behavior
- Axes are accurately rendered.
- This version does not have real-time musical data graphing.

# 6. Usage Notes

### Audio Initialization

Audio is blocked by browsers until a user interacts with them.  
To enable audio playback, the system make use of resumeAudio() and initAudioOnFirstClick().

### Tempo Editing
Tempo modifications immediately re-run preprocessing and playback after making direct changes to the script text.

### Volume / Reverb / Effects
These values are stored in JSON but not linked to Strudel audio engine.  
They are UI only controls.

### D3 Graph Limitations
At the moment, only axes are shown on the graph.  
Strudel values must be passed on via patched console events in order to plot.

### Hidden Piano Roll
The canvas id="roll" is intentionally hidden and rendered only by StrudelMirror.


# 7. Demonstration Video

Link:  https://1drv.ms/v/c/90d5112857ddc254/ETIphEQTZmRCsTJZ_2D1pCwBQJzXDAdC1WvA9NS_lz_zsQ?e=AdypbJ

