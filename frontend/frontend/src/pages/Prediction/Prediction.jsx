import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout/Layout";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import { getDatasets, getDatasetPreview } from "../../services/dataset";
import { trainModel } from "../../services/prediction";
import { FaCogs, FaPlay, FaBrain, FaChartLine } from "react-icons/fa";
import "./Prediction.css";

const algorithms = {
  regression: ["Linear Regression", "Polynomial Regression", "Neural Network (Regression)"],
  classification: ["kNN", "Decision Tree", "Random Forest", "SVM", "Neural Network (Classification)"],
  deep_learning: ["Convolutional Neural Network (CNN)", "Transfer Learning"]
};

function Prediction() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [columns, setColumns] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [taskType, setTaskType] = useState("regression");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("Linear Regression");
  
  // Params
  const [params, setParams] = useState({
    test_size: 0.2,
    k: 5,
    max_depth: 5,
    n_estimators: 100,
    kernel: "rbf",
    degree: 2,
    epochs: 5,
    learning_rate: 0.001,
    dropout: 0.25,
    hidden_layers: "64,32"
  });

  const [loading, setLoading] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [modelResult, setModelResult] = useState(null);

  useEffect(() => {
    getDatasets()
      .then((data) => {
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDatasetId(data[0].id);
        }
      })
      .catch((err) => console.error("Error loading datasets:", err));
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;

    getDatasetPreview(selectedDatasetId)
      .then((data) => {
        setColumns(data.columns || []);
        if (data.columns && data.columns.length > 0) {
          setSelectedTarget(data.columns[data.columns.length - 1]);
        }
      })
      .catch((err) => console.error("Error fetching preview columns:", err));
  }, [selectedDatasetId]);

  // Sync algorithm selector with task type
  useEffect(() => {
    setSelectedAlgorithm(algorithms[taskType][0]);
  }, [taskType]);

  const handleParamChange = (name, val) => {
    setParams({ ...params, [name]: val });
  };

  const handleTrain = async (e) => {
    e.preventDefault();
    if (!selectedDatasetId || !selectedTarget) return;

    setLoading(true);
    setTrainingLogs([]);
    setModelResult(null);

    // If deep learning, simulate the progress logs locally with intervals
    if (taskType === "deep_learning") {
      setTrainingLogs(["Initializing Deep Learning Model...", "Loading Image Pre-processing modules..."]);
      
      const epochs = parseInt(params.epochs);
      let epoch = 1;

      const interval = setInterval(async () => {
        if (epoch <= epochs) {
          const loss = (1.2 - 0.1 * epoch).toFixed(4);
          const acc = (0.55 + 0.07 * epoch).toFixed(4);
          const valLoss = (1.25 - 0.09 * epoch).toFixed(4);
          const valAcc = (0.52 + 0.07 * epoch).toFixed(4);
          
          setTrainingLogs((prev) => [
            ...prev, 
            `Epoch ${epoch}/${epochs} - loss: ${loss} - accuracy: ${acc} - val_loss: ${valLoss} - val_accuracy: ${valAcc}`
          ]);
          epoch++;
        } else {
          clearInterval(interval);
          setTrainingLogs((prev) => [...prev, "Training Complete! Generating confusion matrix..."]);
          
          try {
            const data = await trainModel(selectedDatasetId, selectedTarget, selectedAlgorithm, params);
            setModelResult(data);
          } catch (err) {
            alert("Error finalizing model training.");
          } finally {
            setLoading(false);
          }
        }
      }, 800);
    } else {
      // Standard ML models
      try {
        setTrainingLogs(["Splitting dataset into train and test sets...", `Fitting ${selectedAlgorithm} model...`]);
        const data = await trainModel(selectedDatasetId, selectedTarget, selectedAlgorithm, params);
        setTrainingLogs((prev) => [...prev, "Training Complete! Evaluating model performance."]);
        setModelResult(data);
      } catch (err) {
        alert("Training failed: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Layout>
      <div className="prediction-page">
        <SectionTitle 
          title="Machine Learning Workspace" 
          subtitle="Tune parameters, initiate model training, and inspect visual evaluation indicators."
        />

        <div className="prediction-layout-grid">
          {/* Controls Form */}
          <div className="prediction-card">
            <div className="card-header-with-icon">
              <FaCogs className="header-icon" />
              <h3>Model Configuration</h3>
            </div>
            
            <form onSubmit={handleTrain} className="train-form">
              <label>Target Dataset</label>
              <select 
                value={selectedDatasetId} 
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                disabled={loading}
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>

              <label>Target Column (y)</label>
              <select 
                value={selectedTarget} 
                onChange={(e) => setSelectedTarget(e.target.value)}
                disabled={loading || columns.length === 0}
              >
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <label>Task Category</label>
              <select 
                value={taskType} 
                onChange={(e) => setTaskType(e.target.value)}
                disabled={loading}
              >
                <option value="regression">Regression (Continuous Targets)</option>
                <option value="classification">Classification (Categories/Discrete)</option>
                <option value="deep_learning">Deep Learning (Simulated Image Tasks)</option>
              </select>

              <label>Algorithm Selection</label>
              <select 
                value={selectedAlgorithm} 
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                disabled={loading}
              >
                {algorithms[taskType].map((alg) => (
                  <option key={alg} value={alg}>{alg}</option>
                ))}
              </select>

              {/* Dynamic Hyperparameters */}
              <div className="hyperparameters-group">
                <h4>Hyperparameters</h4>
                
                <label>Test Split Ratio</label>
                <input 
                  type="number" 
                  step="0.05" 
                  min="0.1" 
                  max="0.5" 
                  value={params.test_size}
                  onChange={(e) => handleParamChange("test_size", e.target.value)}
                  disabled={loading}
                />

                {selectedAlgorithm === "Polynomial Regression" && (
                  <>
                    <label>Polynomial Degree</label>
                    <input 
                      type="number" 
                      min="2" 
                      max="5" 
                      value={params.degree}
                      onChange={(e) => handleParamChange("degree", e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}

                {selectedAlgorithm === "kNN" && (
                  <>
                    <label>Nearest Neighbors (k)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="20" 
                      value={params.k}
                      onChange={(e) => handleParamChange("k", e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}

                {selectedAlgorithm === "Decision Tree" && (
                  <>
                    <label>Max Depth (0 for Infinite)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="30" 
                      value={params.max_depth}
                      onChange={(e) => handleParamChange("max_depth", e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}

                {selectedAlgorithm === "Random Forest" && (
                  <>
                    <label>Number of Estimators</label>
                    <input 
                      type="number" 
                      min="10" 
                      max="500" 
                      value={params.n_estimators}
                      onChange={(e) => handleParamChange("n_estimators", e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}

                {selectedAlgorithm === "SVM" && (
                  <>
                    <label>SVM Kernel</label>
                    <select 
                      value={params.kernel}
                      onChange={(e) => handleParamChange("kernel", e.target.value)}
                      disabled={loading}
                    >
                      <option value="rbf">RBF (Radial Basis Function)</option>
                      <option value="linear">Linear</option>
                      <option value="poly">Polynomial</option>
                    </select>
                  </>
                )}

                {selectedAlgorithm.includes("Neural Network") && (
                  <>
                    <label>Hidden Layers Configuration</label>
                    <input 
                      type="text" 
                      value={params.hidden_layers}
                      placeholder="e.g. 64,32"
                      onChange={(e) => handleParamChange("hidden_layers", e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}

                {taskType === "deep_learning" && (
                  <>
                    <label>Training Epochs</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30" 
                      value={params.epochs}
                      onChange={(e) => handleParamChange("epochs", e.target.value)}
                      disabled={loading}
                    />
                    <label>Dropout Ratio</label>
                    <input 
                      type="number" 
                      step="0.05" 
                      min="0.0" 
                      max="0.8" 
                      value={params.dropout}
                      onChange={(e) => handleParamChange("dropout", e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}
              </div>

              <button type="submit" className="train-submit-btn" disabled={loading || datasets.length === 0}>
                <FaPlay />
                <span>{loading ? "Training model..." : "Train Model & Evaluate"}</span>
              </button>
            </form>
          </div>

          {/* Results Console */}
          <div className="prediction-card">
            <h3>Training Output Console</h3>
            <div className="terminal-logs">
              {trainingLogs.length === 0 ? (
                <p className="placeholder-text">Outputs and training logs will appear here during execution...</p>
              ) : (
                trainingLogs.map((log, idx) => (
                  <div key={idx} className="terminal-line">{log}</div>
                ))
              )}
            </div>

            {modelResult && (
              <div className="training-metrics-results">
                <h4>Evaluation Results</h4>
                
                {/* Regression results (Unit 4.3) */}
                {taskType === "regression" && (
                  <div className="regression-results-group">
                    <div className="metrics-summary-row">
                      <div className="metric-box">
                        <strong>{(modelResult.r2_score * 100).toFixed(2)}%</strong>
                        <span>R² Score</span>
                      </div>
                      <div className="metric-box">
                        <strong>{modelResult.mae?.toFixed(4)}</strong>
                        <span>MAE</span>
                      </div>
                      <div className="metric-box">
                        <strong>{modelResult.mse?.toFixed(4)}</strong>
                        <span>MSE</span>
                      </div>
                    </div>

                    <h5>Sample Forecast Test Cases (Predictions vs Actuals)</h5>
                    <div className="sample-predictions-table-wrapper">
                      <table className="sample-predictions-table">
                        <thead>
                          <tr>
                            <th>Case #</th>
                            <th>Actual Value</th>
                            <th>Predicted Value</th>
                            <th>Variance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modelResult.predictions.map((pred, idx) => {
                            const act = modelResult.actuals[idx];
                            const diff = pred - act;
                            return (
                              <tr key={idx}>
                                <td>Test Case {idx + 1}</td>
                                <td>{act.toFixed(2)}</td>
                                <td>{pred.toFixed(2)}</td>
                                <td style={{ color: diff >= 0 ? "var(--success)" : "var(--danger)" }}>
                                  {diff >= 0 ? "+" : ""}{diff.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Classification / Deep Learning results (Unit 5.3) */}
                {(taskType === "classification" || taskType === "deep_learning") && (
                  <div className="classification-results-group">
                    <div className="metrics-summary-row">
                      <div className="metric-box">
                        <strong>{(modelResult.accuracy * 100).toFixed(2)}%</strong>
                        <span>Accuracy</span>
                      </div>
                      <div className="metric-box">
                        <strong>{(modelResult.error_rate * 100).toFixed(2)}%</strong>
                        <span>Error Rate</span>
                      </div>
                      <div className="metric-box">
                        <strong>{(modelResult.sensitivity * 100).toFixed(2)}%</strong>
                        <span>Sensitivity</span>
                      </div>
                      <div className="metric-box">
                        <strong>{(modelResult.specificity * 100).toFixed(2)}%</strong>
                        <span>Specificity</span>
                      </div>
                    </div>

                    {modelResult.confusion_matrix && (
                      <div className="confusion-matrix-layout">
                        <h5>Confusion Matrix Evaluation</h5>
                        <div className="cm-grid">
                          <div className="cm-axis-label">Actual Class</div>
                          <div className="cm-values-wrapper">
                            {modelResult.confusion_matrix.matrix.map((row, rIdx) => (
                              <div key={rIdx} className="cm-row">
                                {row.map((cellVal, cIdx) => (
                                  <div key={cIdx} className="cm-cell">
                                    <strong>{cellVal}</strong>
                                    <span>
                                      {rIdx === 0 && cIdx === 0 ? "True Negative (TN)" : ""}
                                      {rIdx === 0 && cIdx === 1 ? "False Positive (FP)" : ""}
                                      {rIdx === 1 && cIdx === 0 ? "False Negative (FN)" : ""}
                                      {rIdx === 1 && cIdx === 1 ? "True Positive (TP)" : ""}
                                      {modelResult.confusion_matrix.matrix.length > 2 ? `Col ${cIdx}` : ""}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {modelResult.layers && (
                      <div className="deep-learning-architecture">
                        <h5>Model Neural Architecture Layers</h5>
                        <div className="layers-stack">
                          {modelResult.layers.map((layer, idx) => (
                            <div key={idx} className="layer-block">
                              <span>{idx + 1}. {layer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Prediction;
