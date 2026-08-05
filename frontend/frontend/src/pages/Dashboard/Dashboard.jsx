import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout/Layout";
import SectionTitle from "../../components/common/SectionTitle/SectionTitle";
import { getDatasets, getDatasetPreview } from "../../services/dataset";
import { getModels } from "../../services/prediction";
import { FaDatabase, FaBrain, FaRegChartBar, FaAngleRight } from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  const [selectedColumn, setSelectedColumn] = useState("");
  const [chartType, setChartType] = useState("line");
  const [chartData, setChartData] = useState(null);

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
        setColumns(data.columns || []);
        // Select first column as default
        if (data.columns && data.columns.length > 0) {
          setSelectedColumn(data.columns[0]);
        }
      })
      .catch((err) => console.error("Error fetching preview for dashboard:", err));
  }, [selectedDatasetId]);

  // Build chart data when selected column or dataset preview changes
  useEffect(() => {
    if (!selectedDatasetId || !selectedColumn) return;

    getDatasetPreview(selectedDatasetId)
      .then((data) => {
        const rows = data.rows || [];
        const labels = rows.map((_, i) => `Row ${i + 1}`);
        const values = rows.map((row) => {
          const val = Number(row[selectedColumn]);
          return isNaN(val) ? 0 : val;
        });

        setChartData({
          labels,
          datasets: [
            {
              label: selectedColumn,
              data: values,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
            },
          ],
        });
      })
      .catch((err) => console.error("Error updating chart:", err));
  }, [selectedDatasetId, selectedColumn]);

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
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#cbd5e1" }
      },
      y: {
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

              <label>Select Column to Graph</label>
              <select 
                value={selectedColumn} 
                onChange={(e) => setSelectedColumn(e.target.value)}
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

              <label>Chart Style</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="line">Line Plot</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
          </div>

          <div className="chart-view-card">
            <div className="chart-container">
              {chartData ? (
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
