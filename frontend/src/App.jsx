import { useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function Answer({ data }) {
  if (!data) return null;
  return <div className="answer-card">
    <div className="category-pill">{data.category_label}</div>
    <h3>Here’s what you should do</h3>
    <p className="explanation">{data.explanation}</p>
    <div className="authority-box"><span className="label">Concerned authority</span><strong>{data.authority}</strong></div>
    {data.phone && <div className="contact-row"><span>📞 Phone</span><span>{data.phone}</span></div>}
    {data.email && <div className="contact-row"><span>✉️ Email</span><a href={`mailto:${data.email}`}>{data.email}</a></div>}
    {data.portal && <a className="portal-button" href={data.portal} target="_blank" rel="noreferrer">Open official complaint portal ↗</a>}
    {data.attachment_note && <p className="attachment-note">{data.attachment_note}</p>}
  </div>;
}

export default function App() {
  const [message,setMessage]=useState("");
  const [selectedFile,setSelectedFile]=useState(null);
  const [answer,setAnswer]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const fileInput=useRef(null);

  async function submitReport(e) {
    e.preventDefault();
    if (!message.trim() && !selectedFile) { setError("Tell me what happened or attach an image/video."); return; }
    setLoading(true); setError(""); setAnswer(null);
    const fd=new FormData(); fd.append("message",message); if(selectedFile) fd.append("file",selectedFile);
    try {
      const r=await fetch(`${API_URL}/api/report`,{method:"POST",body:fd});
      const d=await r.json();
      if(!r.ok || !d.ok) throw new Error(d.error || "Something went wrong.");
      setAnswer(d.result);
    } catch { setError("Could not connect to the server. Make sure the FastAPI backend is running."); }
    finally { setLoading(false); }
  }

  function chooseFile(e) {
    const f=e.target.files?.[0]; if(!f) return;
    if(!f.type.startsWith("image/") && !f.type.startsWith("video/")) { setError("Please choose an image or video."); return; }
    setSelectedFile(f); setError("");
  }

  return <main className="page"><section className="app-shell">
    <header className="topbar"><div className="brand"><div className="logo">?</div><span>Kya Karu?</span></div></header>
    <section className="hero">
      {!answer ? <><div className="hero-icon">?</div><h1>Kya Karu?</h1><p>Don’t know where to complain? Tell us what happened.<br/>We’ll help you find the right authority.</p></> :
      <div className="result-area"><div className="user-message"><span>You</span><p>{message || "Attached an image/video."}</p></div><Answer data={answer}/></div>}
    </section>

    <form className="composer-wrap" onSubmit={submitReport}>
      {selectedFile && <div className="file-chip"><span>📎 {selectedFile.name}</span><button type="button" onClick={()=>{setSelectedFile(null);if(fileInput.current)fileInput.current.value=""}}>×</button></div>}
      <div className="composer">
        <button type="button" className="add-button" onClick={()=>fileInput.current?.click()}>+</button>
        <input ref={fileInput} type="file" accept="image/*,video/*" onChange={chooseFile} hidden />
        <input className="message-input" value={message} onChange={e=>setMessage(e.target.value)} placeholder="What happened?" />
        <button className="send-button" type="submit" disabled={loading}>{loading ? "…" : "↑"}</button>
      </div>
      {error && <p className="error">{error}</p>}
      <p className="privacy-note">No account • No chat history • Lightweight local MVP</p>
    </form>
  </section></main>;
}

