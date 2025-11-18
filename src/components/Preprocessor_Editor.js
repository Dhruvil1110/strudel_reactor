export default function Preprocessor_Editor({ value, onChange }) {
    return (
        <div className="panel editor-panel">    
            <textarea
                className="code-box"    // Textarea for code input
                value={value}      // Controlled value from parent
                onChange={e => onChange(e.target.value)}   // Update parent state on change
                placeholder={"setcps(140/60/4)\n<tempo/>\n<drum_Rodio/>"}   // Placeholder text
                rows={15}       // Set number of rows 
            />
        </div>
    );
}