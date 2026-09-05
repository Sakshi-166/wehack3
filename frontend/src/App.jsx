import { useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function App() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function handleFiles(event) {
    setFiles(Array.from(event.target.files || []));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!description.trim()) {
      setError("Please describe your problem first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("location", location);

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`${API_URL}/api/report`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend returned an error.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        "Could not connect to the backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="chat-shell">
        <header className="header">
          <div>
            <h1>Kya Karu?</h1>
            <p>Tell us your problem. We'll help you find where to report it.</p>
          </div>
        </header>

        <div className="content">
          {!result && !loading && (
            <div className="welcome">
              <h2>What happened?</h2>
              <p>
                Describe your problem in simple words. You can also add a
                photo or video as supporting evidence.
              </p>

              <div className="examples">
                <button onClick={() => setDescription("There is a water problem in my college hostel.")}>
                  College / Hostel
                </button>
                <button onClick={() => setDescription("The food I received from a restaurant was stale and unhygienic.")}>
                  Food / Hotel
                </button>
                <button onClick={() => setDescription("There is a large pothole on my street.")}>
                  Public Service
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="status-card">
              <div className="loader"></div>
              <p>Finding the right authority...</p>
            </div>
          )}

          {result && (
            <div className="result-card">
              <div className="result-label">ROUTING RESULT</div>
              <h2>{result.authority}</h2>
              <p className="reason">{result.reason}</p>

              <div className="info-row">
                <span>Category</span>
                <strong>{result.category.replaceAll("_", " ")}</strong>
              </div>

              <div className="info-row">
                <span>Complaint channel</span>
                <strong>{result.official_channel}</strong>
              </div>

              {result.location && (
                <div className="info-row">
                  <span>Location</span>
                  <strong>{result.location}</strong>
                </div>
              )}

              <h3>What to do next</h3>
              <ol>
                {result.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>

              <a
                className="official-link"
                href={result.website}
                target="_blank"
                rel="noreferrer"
              >
                Open official channel ↗
              </a>

              <button
                className="new-report"
                onClick={() => {
                  setResult(null);
                  setDescription("");
                  setLocation("");
                  setFiles([]);
                }}
              >
                Report another problem
              </button>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {!result && !loading && (
            <form className="composer" onSubmit={handleSubmit}>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Type your problem here..."
                rows="3"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={handleFiles}
              />

              <div className="composer-bottom">
                <div className="left-actions">
                  <button
                    type="button"
                    className="plus"
                    title="Add image or video"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    +
                  </button>

                  {files.length > 0 && (
                    <span className="file-count">
                      {files.length} attachment{files.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <button className="send" type="submit">
                  Send
                </button>
              </div>
            </form>
          )}
        </div>

        <footer>
          Kya Karu? guides you to existing official complaint channels. It does
          not replace government or institutional authorities.
        </footer>
      </section>
    </main>
  );
}
