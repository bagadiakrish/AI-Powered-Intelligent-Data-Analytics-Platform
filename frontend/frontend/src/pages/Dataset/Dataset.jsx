import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout/Layout";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import { 
  getDatasets, 
  uploadDataset, 
  deleteDataset, 
  getDatasetPreview, 
  cleanDataset 
} from "../../services/dataset";
import { 
  FaCloudUploadAlt, 
  FaTrash, 
  FaDownload, 
  FaEye, 
  FaFileAlt, 
  FaBroom 
} from "react-icons/fa";
import "./Dataset.css";

function DatasetPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Selected dataset preview state
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Cleaning settings state
  const [cleanOptions, setCleanOptions] = useState({
    drop_nulls: false,
    fill_nulls: false,
    drop_duplicates: false,
    remove_outliers: false
  });
  const [cleaning, setCleaning] = useState(false);

  const fetchDatasets = () => {
    setLoading(true);
    getDatasets()
      .then((data) => {
        setDatasets(data);
        if (data.length > 0 && !activeDatasetId) {
          setActiveDatasetId(data[0].id);
        }
      })
      .catch((err) => console.error("Error loading datasets:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (!activeDatasetId) {
      setPreviewData(null);
      return;
    }
    setPreviewLoading(true);
    getDatasetPreview(activeDatasetId)
      .then((data) => setPreviewData(data))
      .catch((err) => console.error("Error loading preview:", err))
      .finally(() => setPreviewLoading(false));
  }, [activeDatasetId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const isCsv = fileName.endsWith(".csv");
      const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
      
      if (!isCsv && !isExcel) {
        alert("Unsupported file format! Nexora only supports CSV (.csv) and Excel (.xlsx, .xls) files.");
        e.target.value = ""; // Clear file selector input
        setFile(null);
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      const data = await uploadDataset(formData);
      setDatasets([...datasets, data]);
      setActiveDatasetId(data.id);
      setFile(null);
      setTitle("");
    } catch (err) {
      alert("Failed to upload dataset: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dataset? All trained models linked to it will also be deleted.")) return;
    
    try {
      await deleteDataset(id);
      setDatasets(datasets.filter((d) => d.id !== id));
      if (activeDatasetId === id) {
        setActiveDatasetId(datasets.length > 1 ? datasets.find(d => d.id !== id).id : null);
      }
    } catch (err) {
      alert("Failed to delete dataset.");
    }
  };

  const handleClean = async () => {
    if (!activeDatasetId) return;
    setCleaning(true);

    try {
      const res = await cleanDataset(activeDatasetId, cleanOptions);
      alert(`Data cleaning complete! New dataset size: ${res.rows} rows, ${res.cols} columns.`);
      
      // Force preview & datasets lists reload
      fetchDatasets();
      getDatasetPreview(activeDatasetId).then((data) => setPreviewData(data));
    } catch (err) {
      alert("Failed to clean dataset.");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Layout>
      <div className="dataset-page">
        <SectionTitle 
          title="Datasets Workspace" 
          subtitle="Manage raw data imports, execute Pandas cleanups, and inspect schema structures."
        />

        <div className="dataset-workspace-grid">
          {/* Upload card */}
          <div className="workspace-card">
            <h3>Upload Dataset</h3>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="file-drop-zone">
                <FaCloudUploadAlt className="upload-icon" />
                {file ? (
                  <p className="file-selected-name">{file.name}</p>
                ) : (
                  <p>Drag and drop or click to choose a CSV/Excel file</p>
                )}
                <input 
                  type="file" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleFileChange}
                  required={!file} 
                />
              </div>

              <label>Dataset Title</label>
              <input 
                type="text" 
                placeholder="Give your dataset a title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />

              <button type="submit" className="upload-submit-btn" disabled={uploading || !file}>
                {uploading ? "Uploading..." : "Import File"}
              </button>
            </form>
          </div>

          {/* Dataset list card */}
          <div className="workspace-card">
            <h3>Imported Datasets</h3>
            <div className="datasets-list">
              {loading ? (
                <p>Loading datasets...</p>
              ) : datasets.length === 0 ? (
                <p className="empty-state">No datasets available. Please upload a dataset file first.</p>
              ) : (
                datasets.map((d) => (
                  <div 
                    key={d.id} 
                    className={`dataset-item-row ${activeDatasetId === d.id ? "active" : ""}`}
                    onClick={() => setActiveDatasetId(d.id)}
                  >
                    <div className="dataset-item-info">
                      <FaFileAlt className="file-icon" />
                      <div>
                        <strong>{d.title}</strong>
                        <span>{d.rows} rows x {d.cols} cols | {(d.size_bytes / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <div className="dataset-item-actions">
                      <a 
                        href={`http://127.0.0.1:8000/api/datasets/${d.id}/download/`}
                        className="download-action-btn"
                        title="Download raw file"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaDownload />
                      </a>
                      <button 
                        className="delete-action-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(d.id);
                        }}
                        title="Delete dataset"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {activeDatasetId && (
          <div className="dataset-processing-section">
            {/* Cleaning options */}
            <div className="workspace-card cleaning-card">
              <div className="card-header-with-icon">
                <FaBroom className="header-icon" />
                <h3>Pandas Data Cleaning Operations</h3>
              </div>
              <p className="description">Perform tabular operations on the active dataset using Pandas cleaning functions.</p>
              
              <div className="cleaning-toggles-grid">
                <label className="checkbox-toggle">
                  <input 
                    type="checkbox" 
                    checked={cleanOptions.drop_nulls}
                    onChange={(e) => setCleanOptions({...cleanOptions, drop_nulls: e.target.checked})}
                  />
                  <span>Drop Missing Rows (dropna)</span>
                </label>

                <label className="checkbox-toggle">
                  <input 
                    type="checkbox" 
                    checked={cleanOptions.fill_nulls}
                    onChange={(e) => setCleanOptions({...cleanOptions, fill_nulls: e.target.checked})}
                  />
                  <span>Fill Empty Values with Median (fillna)</span>
                </label>

                <label className="checkbox-toggle">
                  <input 
                    type="checkbox" 
                    checked={cleanOptions.drop_duplicates}
                    onChange={(e) => setCleanOptions({...cleanOptions, drop_duplicates: e.target.checked})}
                  />
                  <span>Remove Duplicate Rows (drop_duplicates)</span>
                </label>

                <label className="checkbox-toggle">
                  <input 
                    type="checkbox" 
                    checked={cleanOptions.remove_outliers}
                    onChange={(e) => setCleanOptions({...cleanOptions, remove_outliers: e.target.checked})}
                  />
                  <span>Handle Selling Outliers (IQR Method)</span>
                </label>
              </div>

              <button 
                onClick={handleClean} 
                className="clean-btn" 
                disabled={cleaning}
              >
                {cleaning ? "Processing..." : "Run Pandas Cleaners"}
              </button>
            </div>

            {/* Table Preview */}
            <div className="workspace-card preview-card">
              <h3>Dataset Rows Preview (First 10 records)</h3>
              <div className="preview-table-container">
                {previewLoading ? (
                  <p>Loading table preview...</p>
                ) : !previewData || !previewData.rows ? (
                  <p>No preview rows available.</p>
                ) : (
                  <table className="dataset-preview-table">
                    <thead>
                      <tr>
                        {previewData.columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {previewData.columns.map((col) => (
                            <td key={col}>{row[col] !== null ? String(row[col]) : "NaN"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DatasetPage;
