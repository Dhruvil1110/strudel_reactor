export default function Preprocessor_Editor({ value, onChange }) {
    return (
        <div className="panel editor-panel">
            <textarea
                className="code-box"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={"setcps(140/60/4)\n<tempo/>\n<drum_Rodio/>"}
                rows={15}
            />
        </div>
    );
}