import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout/Layout";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import { getModels, deleteModel } from "../../services/prediction";
import { FaFilePdf, FaEye, FaDownload, FaTrash } from "react-icons/fa";
import "./Reports.css";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    getModels()
      .then((data) => setReports(data))
      .catch((err) => console.error("Error loading reports:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePreview = (report) => {
    let details = `Report ID: #${report.id}\n`;
    details += `Algorithm: ${report.algorithm}\n`;
    details += `Dataset: ${report.dataset_title || "Unknown"}\n`;
    details += `Target Variable: ${report.target_column}\n`;
    details += `Date Trained: ${new Date(report.created_at).toLocaleString()}\n\n`;

    if (report.r2_score !== null) {
      details += `REGRESSION METRICS:\n`;
      details += `- R² Score: ${(report.r2_score * 100).toFixed(2)}%\n`;
      details += `- Mean Absolute Error (MAE): ${report.mae?.toFixed(4)}\n`;
      details += `- Mean Squared Error (MSE): ${report.mse?.toFixed(4)}\n`;
    } else {
      details += `CLASSIFICATION METRICS:\n`;
      details += `- Accuracy: ${(report.accuracy * 100).toFixed(2)}%\n`;
      details += `- Error Rate: ${(report.error_rate * 100).toFixed(2)}%\n`;
      details += `- Sensitivity: ${(report.sensitivity * 100).toFixed(2)}%\n`;
      details += `- Specificity: ${(report.specificity * 100).toFixed(2)}%\n`;
    }

    alert(details);
  };

  const handleDownload = (report) => {
    let content = `==================================================\n`;
    content += `         NEXORA ANALYTICS TRAINING REPORT         \n`;
    content += `==================================================\n\n`;
    content += `Model ID: #${report.id}\n`;
    content += `Algorithm: ${report.algorithm}\n`;
    content += `Dataset Name: ${report.dataset_title || "Unknown"}\n`;
    content += `Target Column: ${report.target_column}\n`;
    content += `Date Generated: ${new Date(report.created_at).toLocaleString()}\n\n`;

    if (report.r2_score !== null) {
      content += `EVALUATION METRICS (REGRESSION):\n`;
      content += `--------------------------------------------------\n`;
      content += `R-Squared (R²): ${(report.r2_score * 100).toFixed(4)}%\n`;
      content += `Mean Absolute Error (MAE): ${report.mae?.toFixed(6)}\n`;
      content += `Mean Squared Error (MSE): ${report.mse?.toFixed(6)}\n`;
    } else {
      content += `EVALUATION METRICS (CLASSIFICATION):\n`;
      content += `--------------------------------------------------\n`;
      content += `Accuracy: ${(report.accuracy * 100).toFixed(4)}%\n`;
      content += `Error Rate: ${(report.error_rate * 100).toFixed(4)}%\n`;
      content += `Sensitivity: ${(report.sensitivity * 100).toFixed(4)}%\n`;
      content += `Specificity: ${(report.specificity * 100).toFixed(4)}%\n`;
      
      if (report.confusion_matrix) {
        content += `\nConfusion Matrix values:\n`;
        content += `${JSON.stringify(report.confusion_matrix.matrix)}\n`;
      }
    }

    content += `\n==================================================\n`;
    content += `End of report.\n`;

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `model_report_#${report.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteModel(id);
      setReports(reports.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  return (
    <Layout>
      <div className="reports-page">
        <SectionTitle 
          title="Trained Model Reports" 
          subtitle="Preview metrics and export formal summary reports."
        />

        <div className="reports-layout-card">
          <div className="reports-table-header">
            <h3>History Logs</h3>
            <span className="reports-count">{reports.length} logs found</span>
          </div>

          <div className="reports-table-container">
            {loading ? (
              <p>Loading reports...</p>
            ) : reports.length === 0 ? (
              <div className="empty-reports-state">
                <p>No model reports available. Train a model in the Prediction Workspace to generate logs.</p>
              </div>
            ) : (
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Algorithm</th>
                    <th>Dataset Origin</th>
                    <th>Target Col</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td># {report.id}</td>
                      <td>
                        <div className="report-name-cell">
                          <FaFilePdf className="pdf-icon" />
                          <span>{report.algorithm}</span>
                        </div>
                      </td>
                      <td>{report.dataset_title || "dataset_source"}</td>
                      <td><code>{report.target_column}</code></td>
                      <td>{new Date(report.created_at).toLocaleString()}</td>
                      <td>
                        <div className="reports-actions">
                          <button onClick={() => handlePreview(report)} className="preview-btn" title="Quick preview metrics">
                            <FaEye />
                          </button>
                          <button onClick={() => handleDownload(report)} className="download-btn" title="Download report file">
                            <FaDownload />
                          </button>
                          <button onClick={() => handleDelete(report.id)} className="delete-btn" title="Delete report">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Reports;
