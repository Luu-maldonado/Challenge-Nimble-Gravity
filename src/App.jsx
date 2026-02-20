import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const BASE_URL = 'https://botfilter-h5ddh6dye8exb7ha.centralus-01.azurewebsites.net';
  const MY_EMAIL = 'lucimaldonado12@gmail.com';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCandidate = await fetch(`${BASE_URL}/api/candidate/get-by-email?email=${MY_EMAIL}`);
        const dataCandidate = await resCandidate.json();
        setCandidate(dataCandidate);

        const resJobs = await fetch(`${BASE_URL}/api/jobs/get-list`);
        const dataJobs = await resJobs.json();
        setJobs(dataJobs);
      } catch (error) {
        console.error("Error cargando datos:", error);
        showNotification("Error loading data. Please try again later.", "error");
      }
    };

    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApply = async (jobId, repoUrl) => {
    if (!repoUrl) return showNotification("Please enter your repo URL", "error");

    // Simple GitHub URL validation
    if (!repoUrl.includes('github.com')) {
      return showNotification("Please provide a valid GitHub repository URL", "error");
    }

    setLoading(true);
    const payload = {
      uuid: candidate?.uuid,
      jobId: jobId,
      candidateId: candidate?.candidateId,
      applicationId: candidate?.applicationId,
      repoUrl: repoUrl
    };

    try {
      const response = await fetch(`${BASE_URL}/api/candidate/apply-to-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok) {
        showNotification("Application submitted successfully!");
      } else {
        showNotification(result.message || "Something went wrong", "error");
      }
    } catch (error) {
      showNotification("Error sending application", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Nimble Gravity Challenge</h1>
      {candidate && (
        <p className="welcome-msg">
          Welcome, <strong>{candidate.firstName}</strong>
        </p>
      )}

      <div className="job-list">
        {jobs.length > 0 ? (
          jobs.map(job => (
            <JobCard key={job.id} job={job} onApply={handleApply} loading={loading} />
          ))
        ) : (
          <p>Loading positions...</p>
        )}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  )
}

function JobCard({ job, onApply, loading }) {
  const [url, setUrl] = useState('');

  return (
    <div className="job-card glass-panel">
      <h3>{job.title}</h3>
      <p>{job.description || "Join our team and help us build amazing data-driven solutions at Nimble Gravity."}</p>

      <div className="apply-container">
        <input
          type="text"
          placeholder="GitHub Repository URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button onClick={() => onApply(job.id, url)} disabled={loading || !url}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

export default App