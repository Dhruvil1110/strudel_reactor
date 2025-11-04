export default function Strudel_Output({ text }) {
    return (
        <div className="panel output-panel">
            <h2 className="heading purple">Strudel Output</h2>
            <pre className="code-box">{text || "…"</pre>
        </div>
    );
}