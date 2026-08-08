import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout/Layout";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import { getDatasets, getDatasetPreview } from "../../services/dataset";
import { getModels } from "../../services/prediction";
import { FaDatabase, FaBrain, FaRegChartBar, FaAngleRight } from "react-icons/fa";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selector state for dynamic charts
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [columns, setColumns] = useState([]);
  const [selectedXColumn, setSelectedXColumn] = useState("");
  const [selectedYColumns, setSelectedYColumns] = useState([]);
  const [chartType, setChartType] = useState("line");
  const [chartData, setChartData] = useState(null);
  const [boxSummary, setBoxSummary] = useState(null);

  useEffect(() => {
    Promise.all([getDatasets(), getModels()])
      .then(([datasetsData, modelsData]) => {
        setDatasets(datasetsData);
        setModels(modelsData);
        if (datasetsData.length > 0) {
          setSelectedDatasetId(datasetsData[0].id);
        }
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch columns and data when selected dataset changes
  useEffect(() => {
    if (!selectedDatasetId) return;

    getDatasetPreview(selectedDatasetId)
      .then((data) => {
        const cols = data.columns || [];
        setColumns(cols);
        if (cols.length > 0) {
          setSelectedXColumn(cols[0]);
          setSelectedYColumns(cols.length > 1 ? [cols[1]] : [cols[0]]);
        }
      })
      .catch((err) => console.error("Error fetching preview for dashboard:", err));
  }, [selectedDatasetId]);

  // Build chart data when selected column or dataset preview changes
  useEffect(() => {
    if (!selectedDatasetId || selectedYColumns.length === 0) return;

    getDatasetPreview(selectedDatasetId)
      .then((data) => {
        const rows = data.rows || [];
        const primaryYColumn = selectedYColumns[0];
        const numericValues = rows
          .map((row) => Number(row[primaryYColumn]))
          .filter((val) => !isNaN(val));

        if (chartType === "box") {
          setChartData(null);
          if (numericValues.length === 0) {
            setBoxSummary(null);
            return;
          }
          const sorted = [...numericValues].sort((a, b) => a - b);
          const min = sorted[0];
          const max = sorted[sorted.length - 1];
          const getPercentile = (p) => {
            const idx = (sorted.length - 1) * p;
            const base = Math.floor(idx);
            const rest = idx - base;
            if (sorted[base + 1] !== undefined) {
              return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
            }
            return sorted[base];
          };
          const q1 = getPercentile(0.25);
          const median = getPercentile(0.5);
          const q3 = getPercentile(0.75);

          setBoxSummary({ min, q1, median, q3, max });
        } else if (chartType === "histogram") {
          setBoxSummary(null);
          if (numericValues.length === 0) {
            setChartData(null);
            return;
          }
          const min = Math.min(...numericValues);
          const max = Math.max(...numericValues);
          const binCount = 5;
          const range = max - min;
          const binWidth = range === 0 ? 1 : range / binCount;

          const bins = Array(binCount).fill(0);
          const binLabels = Array(binCount).fill("").map((_, i) => {
            const start = min + i * binWidth;
            const end = start + binWidth;
            return `${start.toFixed(1)} - ${end.toFixed(1)}`;
          });

          numericValues.forEach((val) => {
            let binIdx = Math.floor((val - min) / binWidth);
            if (binIdx >= binCount) binIdx = binCount - 1;
            if (binIdx < 0) binIdx = 0;
            bins[binIdx]++;
          });

          setChartData({
            labels: binLabels,
            datasets: [
              {
                label: `Frequency of ${primaryYColumn}`,
                data: bins,
                backgroundColor: "rgba(14, 165, 233, 0.6)",
                borderColor: "#0ea5e9",
                borderWidth: 2,
              }
            ]
          });
        } else {
          setBoxSummary(null);
          const labels = rows.map((row) => String(row[selectedXColumn] || ""));
          
          const colors = [
            { border: "#6366f1", bg: "rgba(99, 102, 241, 0.6)", bgLine: "rgba(99, 102, 241, 0.15)" },
            { border: "#10b981", bg: "rgba(16, 185, 129, 0.6)", bgLine: "rgba(16, 185, 129, 0.15)" },
            { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.6)", bgLine: "rgba(245, 158, 11, 0.15)" },
            { border: "#ec4899", bg: "rgba(236, 72, 153, 0.6)", bgLine: "rgba(236, 72, 153, 0.15)" },
            { border: "#a855f7", bg: "rgba(168, 85, 247, 0.6)", bgLine: "rgba(168, 85, 247, 0.15)" },
          ];

          const datasets = selectedYColumns.map((col, idx) => {
            const values = rows.map((row) => {
              const val = Number(row[col]);
              return isNaN(val) ? 0 : val;
            });
            const color = colors[idx % colors.length];
            return {
              label: col,
              data: values,
              borderColor: color.border,
              backgroundColor: chartType === "bar" ? color.bg : color.bgLine,
              fill: chartType === "line",
              tension: 0.4,
              borderWidth: 3,
            };
          });

          setChartData({
            labels,
            datasets
          });
        }
      })
      .catch((err) => console.error("Error updating chart:", err));
  }, [selectedDatasetId, selectedXColumn, selectedYColumns, chartType]);

  const handleYColumnToggle = (col) => {
    if (selectedYColumns.includes(col)) {
      if (selectedYColumns.length > 1) {
        setSelectedYColumns(selectedYColumns.filter((c) => c !== col));
      }
    } else {
      setSelectedYColumns([...selectedYColumns, col]);
    }
  };

  const successRate = models.length 
    ? Math.round((models.filter(m => (m.r2_score && m.r2_score > 0.5) || (m.accuracy && m.accuracy > 0.7)).length / models.length) * 100)
    : 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#cbd5e1",
          font: { family: "Plus Jakarta Sans" }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: chartType === "histogram" ? "Bin Ranges" : selectedXColumn,
          color: "#cbd5e1",
          font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
        },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#cbd5e1" }
      },
      y: {
        title: {
          display: true,
          text: chartType === "histogram" ? "Frequency Count" : (selectedYColumns.length === 1 ? selectedYColumns[0] : "Values"),
          color: "#cbd5e1",
          font: { family: "Plus Jakarta Sans", size: 12, weight: "bold" }
        },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#cbd5e1" }
      }
    }
  };

  return (
    <Layout>
      <div className="dashboard-page">
        <SectionTitle 
          title="Executive Dashboard" 
          subtitle="Analyze dynamic dataset metrics and supervise machine learning actions."
        />

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="stat-icon-wrapper blue">
              <FaDatabase />
            </div>
            <div className="stat-content">
              <h3>{datasets.length}</h3>
              <p>Total Datasets</p>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon-wrapper purple">
              <FaBrain />
            </div>
            <div className="stat-content">
              <h3>{models.length}</h3>
              <p>Trained Models</p>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon-wrapper green">
              <FaRegChartBar />
            </div>
            <div className="stat-content">
              <h3>{successRate}%</h3>
              <p>Model Success Rate</p>
            </div>
          </div>
        </div>

        <div className="dashboard-charts-layout">
          <div className="chart-controls-card">
            <h3>Dynamic Dataset Visualizer</h3>
            <p className="subtitle">Select any uploaded dataset and numeric column to graph live aggregates.</p>

            <div className="controls-group">
              <label>Select Dataset</label>
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

              {chartType !== "histogram" && chartType !== "box" && (
                <>
                  <label>Select X-Axis Column (Independent)</label>
                  <select 
                    value={selectedXColumn} 
                    onChange={(e) => {
                      const newX = e.target.value;
                      setSelectedXColumn(newX);
                      setSelectedYColumns((prev) => prev.filter((y) => y !== newX));
                    }}
                    disabled={columns.length === 0}
                  >
                    {columns.length === 0 ? (
                      <option value="">No columns</option>
                    ) : (
                      columns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))
                    )}
                  </select>
                </>
              )}

              <label>{chartType === "histogram" || chartType === "box" ? "Select Numeric Column (First checked)" : "Select Y-Axis Column(s) (Dependent)"}</label>
              <div className="premium-checkbox-list">
                {columns.filter((col) => chartType === "histogram" || chartType === "box" || col !== selectedXColumn).map((col) => (
                  <div key={col} className="premium-checkbox-item">
                    <input 
                      type="checkbox" 
                      id={`dashboard-chk-${col}`}
                      checked={selectedYColumns.includes(col)} 
                      onChange={() => handleYColumnToggle(col)}
                      disabled={columns.length === 0}
                    />
                    <label htmlFor={`dashboard-chk-${col}`}>{col}</label>
                  </div>
                ))}
                {columns.length === 0 && (
                  <span className="placeholder-text" style={{ fontSize: "12px" }}>No columns available</span>
                )}
              </div>

              <label>Chart Style</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="line">Line Plot</option>
                <option value="bar">Bar Chart</option>
                <option value="histogram">Histogram</option>
                <option value="box">Box Plot (Whisker)</option>
              </select>
            </div>
          </div>

          <div className="chart-view-card">
            <div className="chart-container">
              {boxSummary && chartType === "box" ? (
                <div className="box-plot-visualizer">
                  <h4>Box & Whisker Plot: {selectedYColumns[0]}</h4>
                  <div className="box-plot-metrics-grid">
                    <div className="metric-box"><span className="label">Maximum</span><span className="value">{boxSummary.max.toFixed(3)}</span></div>
                    <div className="metric-box"><span className="label">Q3 (75th Percentile)</span><span className="value">{boxSummary.q3.toFixed(3)}</span></div>
                    <div className="metric-box"><span className="label">Median (50th Percentile)</span><span className="value">{boxSummary.median.toFixed(3)}</span></div>
                    <div className="metric-box"><span className="label">Q1 (25th Percentile)</span><span className="value">{boxSummary.q1.toFixed(3)}</span></div>
                    <div className="metric-box"><span className="label">Minimum</span><span className="value">{boxSummary.min.toFixed(3)}</span></div>
                  </div>
                  <div className="box-plot-graphic-container">
                    <div className="box-plot-axis"></div>
                    <div className="whisker-line-vertical" style={{ height: "180px", position: "relative" }}>
                      {/* Max tick */}
                      <div className="whisker-tick max-tick" style={{ top: "0%" }}>Max: {boxSummary.max.toFixed(2)}</div>
                      {/* Box Q3 to Q1 */}
                      <div className="whisker-box" style={{ top: "25%", height: "50%", background: "rgba(99, 102, 241, 0.25)", border: "2px solid #6366f1", position: "absolute", width: "100px", left: "-45px", borderRadius: "4px" }}>
                        {/* Median line */}
                        <div className="median-tick-line" style={{ top: "50%", height: "2px", background: "#0ea5e9", width: "100%", position: "absolute" }}></div>
                        <div style={{ top: "-20px", position: "absolute", fontSize: "10px", color: "#cbd5e1" }}>Q3: {boxSummary.q3.toFixed(2)}</div>
                        <div style={{ top: "40%", position: "absolute", right: "-110px", fontSize: "10px", color: "#0ea5e9", fontWeight: "bold" }}>Median: {boxSummary.median.toFixed(2)}</div>
                        <div style={{ bottom: "-20px", position: "absolute", fontSize: "10px", color: "#cbd5e1" }}>Q1: {boxSummary.q1.toFixed(2)}</div>
                      </div>
                      {/* Min tick */}
                      <div className="whisker-tick min-tick" style={{ bottom: "0%", position: "absolute" }}>Min: {boxSummary.min.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ) : chartData ? (
                chartType === "line" ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )
              ) : (
                <div className="empty-chart-state">
                  <p>Please upload a dataset in the Datasets panel to visualize dynamic data.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-recent-grid">
          <div className="activity-card">
            <h3>Quick Actions</h3>
            <div className="actions-list">
              <a href="/dataset" className="action-row">
                <span>Upload a new dataset</span>
                <FaAngleRight />
              </a>
              <a href="/prediction" className="action-row">
                <span>Train predictive ML models</span>
                <FaAngleRight />
              </a>
              <a href="/reports" className="action-row">
                <span>Inspect model reports</span>
                <FaAngleRight />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
