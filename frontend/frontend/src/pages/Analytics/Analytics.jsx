import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout/Layout";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import { getDatasets } from "../../services/dataset";
import { getOverview, getCorrelation, getCrosstab } from "../../services/analytics";
import { FaChartLine, FaBorderNone, FaTable } from "react-icons/fa";
import { Bar, Scatter } from "react-chartjs-2";
import "./Analytics.css";

function Analytics() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [loading, setLoading] = useState(true);

  // Overview stats
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Correlation matrix
  const [correlation, setCorrelation] = useState({});
  const [corrLoading, setCorrLoading] = useState(false);

  // Cross tabulation
  const [crossTabCol1, setCrossTabCol1] = useState("");
  const [crossTabCol2, setCrossTabCol2] = useState("");
  const [crosstabData, setCrosstabData] = useState(null);
  const [crosstabLoading, setCrosstabLoading] = useState(false);

  useEffect(() => {
    getDatasets()
      .then((data) => {
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDatasetId(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching datasets:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;

    setOverviewLoading(true);
    setCorrLoading(true);
    setCrosstabData(null);

    Promise.all([
      getOverview(selectedDatasetId),
      getCorrelation(selectedDatasetId)
    ])
      .then(([overviewData, corrData]) => {
        setOverview(overviewData);
        setCorrelation(corrData);

        // Pre-populate crosstab selectors
        const cols = overviewData.columns || [];
        if (cols.length >= 2) {
          setCrossTabCol1(cols[0]);
          setCrossTabCol2(cols[1]);
        }
      })
      .catch((err) => console.error("Error loading analytics overview:", err))
      .finally(() => {
        setOverviewLoading(false);
        setCorrLoading(false);
      });
  }, [selectedDatasetId]);

  // Compute Cross Tabulation
  const handleComputeCrosstab = () => {
    if (!selectedDatasetId || !crossTabCol1 || !crossTabCol2) return;
    setCrosstabLoading(true);
    getCrosstab(selectedDatasetId, crossTabCol1, crossTabCol2)
      .then((data) => setCrosstabData(data))
      .catch((err) => alert("Failed to compute crosstab: check if columns are categorical/discrete."))
      .finally(() => setCrosstabLoading(false));
  };

  const corrKeys = Object.keys(correlation);

  return (
    <Layout>
      <div className="analytics-page">
        <SectionTitle 
          title="EDA Visualizer & Analytics" 
          subtitle="Explore dataset shapes, construct cross-tabulations, and analyze correlation heatmaps."
        />

        <div className="analytics-controls">
          <label>Active Dataset</label>
          <select 
            value={selectedDatasetId} 
            onChange={(e) => setSelectedDatasetId(e.target.value)}
          >
            {datasets.length === 0 ? (
              <option value="">No datasets available</option>
            ) : (
              datasets.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))
            )}
          </select>
        </div>

        {selectedDatasetId && overview && (
          <div className="analytics-layout-grid">
            {/* Overview / Data description (Unit 1.1, 1.4) */}
            <div className="analytics-card full-width">
              <h3>Dataset Schema Description</h3>
              <p className="summary-banner">Dimensions: {overview.shape[0]} rows x {overview.shape[1]} columns</p>
              
              <div className="schema-table-container">
                <table className="schema-table">
                  <thead>
                    <tr>
                      <th>Column Name</th>
                      <th>Data Type</th>
                      <th>Null Count</th>
                      <th>Distinct Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.columns.map((col) => (
                      <tr key={col}>
                        <td><strong>{col}</strong></td>
                        <td><code>{overview.dtypes[col]}</code></td>
                        <td>{overview.null_counts[col]}</td>
                        <td>{overview.describe[col]?.count || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Correlation Matrix Heatmap (Unit 1.4 Statistical analysis corr() & Unit 2 Seaborn heatmap) */}
            <div className="analytics-card">
              <h3>Correlation Heatmap</h3>
              <p className="subtitle">Strength representation of numerical variables in dataset.</p>
              {corrLoading ? (
                <p>Loading correlation matrix...</p>
              ) : corrKeys.length === 0 ? (
                <p className="empty-state">No numerical columns found to calculate correlation matrix.</p>
              ) : (
                <div className="heatmap-container">
                  <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${corrKeys.length + 1}, 1fr)` }}>
                    <div className="heatmap-header-cell"></div>
                    {corrKeys.map((k) => (
                      <div key={k} className="heatmap-header-cell truncate" title={k}>{k}</div>
                    ))}

                    {corrKeys.map((rowKey) => (
                      <>
                        <div key={rowKey} className="heatmap-row-header-cell truncate" title={rowKey}>{rowKey}</div>
                        {corrKeys.map((colKey) => {
                          const val = correlation[rowKey][colKey];
                          const colorVal = val !== null ? Math.abs(val) : 0;
                          const bg = val > 0 
                            ? `rgba(99, 102, 241, ${colorVal})` 
                            : `rgba(239, 68, 68, ${colorVal})`;
                          
                          return (
                            <div 
                              key={`${rowKey}-${colKey}`} 
                              className="heatmap-cell"
                              style={{ backgroundColor: bg }}
                              title={`${rowKey} vs ${colKey}: ${val !== null ? val.toFixed(3) : "N/A"}`}
                            >
                              {val !== null ? val.toFixed(2) : "-"}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Two-Way Cross Tabulation (Unit 1.5) */}
            <div className="analytics-card">
              <div className="card-header-with-icon">
                <FaTable className="header-icon" />
                <h3>Two-Way Cross Tabulation</h3>
              </div>
              <p className="subtitle">Inspect distribution frequencies between two categorical fields.</p>
              
              <div className="crosstab-controls">
                <div>
                  <label>Column 1 (Rows)</label>
                  <select value={crossTabCol1} onChange={(e) => setCrossTabCol1(e.target.value)}>
                    {overview.columns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Column 2 (Columns)</label>
                  <select value={crossTabCol2} onChange={(e) => setCrossTabCol2(e.target.value)}>
                    {overview.columns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button onClick={handleComputeCrosstab} className="compute-crosstab-btn" disabled={crosstabLoading}>
                {crosstabLoading ? "Computing..." : "Run Cross-Tabulate"}
              </button>

              <div className="crosstab-result-container">
                {crosstabData ? (
                  <div className="crosstab-table-wrapper">
                    <table className="crosstab-table">
                      <thead>
                        <tr>
                          <th>{crossTabCol1} \ {crossTabCol2}</th>
                          {crosstabData.columns.map((colName) => (
                            <th key={colName}>{String(colName)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {crosstabData.index.map((rowName, rIdx) => (
                          <tr key={rowName}>
                            <td><strong>{String(rowName)}</strong></td>
                            {crosstabData.data[rIdx].map((val, cIdx) => (
                              <td key={cIdx}>{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Select two categorical/classification columns (e.g. Gender and Result) and click button above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Analytics;
