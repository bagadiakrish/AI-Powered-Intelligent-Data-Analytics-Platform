import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaDatabase, 
  FaBrain, 
  FaChartLine, 
  FaCogs, 
  FaHome,
  FaRobot,
  FaServer,
  FaTools,
  FaMeteor
} from "react-icons/fa";
import "./Presentation.css";

const slides = [
  {
    id: 1,
    title: "Nexora Analytics Platform",
    tagline: "NEXT-GENERATION ARTIFICIAL INTELLIGENCE SYSTEM",
    subtitle: "A Unified Full-Stack Workspace for EDA, Preprocessing, and Machine Learning Sandbox",
    type: "hero",
    theme: "cyberpunk",
    details: [
      { label: "Institution", value: "Lok Jagruti University (LJU)" },
      { label: "Framework", value: "React + Django REST + SQLite" },
      { label: "Engines", value: "Pandas Core & Scikit-Learn ML" }
    ]
  },
  {
    id: 2,
    title: "Problem vs. Solution",
    tagline: "THE EVOLUTION OF DATA PIPELINES",
    subtitle: "Overcoming static data constraints and complex preprocessing friction.",
    type: "problem-solution",
    theme: "neon-blue",
    problems: [
      "Static dashboards lock users to hardcoded aggregates.",
      "Manual data preprocessing in python shells is slow and error-prone.",
      "Difficulty comparing algorithms and visualizing neural networks."
    ],
    solutions: [
      "Dynamic dashboard graphs that adapt to any CSV upload.",
      "One-click Pandas pipeline (dropna, fillna, outlier removal).",
      "Interactive evaluation matrices & live DL neural layer logs."
    ]
  },
  {
    id: 3,
    title: "System Architecture",
    tagline: "DECOUPLED MULTI-TIER PIPELINE",
    subtitle: "How Client-Side states map to RESTful asynchronous server execution.",
    type: "architecture",
    theme: "neon-purple",
    layers: [
      { name: "1. Presentation Deck", tech: "React SPA / Chart.js", desc: "State-driven components rendering dynamic line/bar visualizers." },
      { name: "2. Secure Gateways", tech: "JWT Bearer / CORS", desc: "Automatic interceptors appending credentials and handling 401 refresh." },
      { name: "3. Compute Engine", tech: "Pandas & Scikit-Learn", desc: "Dataframe preprocessing and machine learning training sandboxes." },
      { name: "4. Persistence Layer", tech: "SQLite3 / Media Folder", desc: "Storing custom User profiles, metadata structures, and model reports." }
    ]
  },
  {
    id: 4,
    title: "Unit 1 & 2: Pandas EDA & Plots",
    tagline: "EXPLORATORY DATA ANALYSIS ENGINE",
    subtitle: "Automated statistical parsing and correlation plotting.",
    type: "features-grid",
    theme: "neon-green",
    features: [
      { title: "Ingestion & Preview", desc: "Instantly reads CSV/Excel files using pd.read_csv() and renders scrollable previews." },
      { title: "Pandas Cleaning", desc: "Visual controls for dropna(), fillna() median, and drop_duplicates() operations." },
      { title: "Outliers Removal", desc: "Trims values beyond 1.5x IQR bounds to stabilize predictions." },
      { title: "Corr & Crosstab", desc: "Calculates corr() heatmaps and cross-tabulations using pd.crosstab()." }
    ]
  },
  {
    id: 5,
    title: "Unit 3, 4 & 5: ML Sandbox Engine",
    tagline: "PREDICTIVE INTELLIGENCE WORKSPACE",
    subtitle: "Interactive hyperparameters tuning for regression and classification.",
    type: "features-grid",
    theme: "neon-pink",
    features: [
      { title: "Regression Suite", desc: "Simple/Multiple Linear and Polynomial Regression models with R², MAE, and MSE." },
      { title: "Classification Suite", desc: "k-Nearest Neighbors, SVM, Random Forest, and Decision Tree with entropy splits." },
      { title: "Validation Engine", desc: "Flexible train_test_split ratio configurations with randomized states." },
      { title: "Visual Evaluation", desc: "Dynamic confusion matrices, Accuracy, Error Rate, Sensitivity, and Specificity." }
    ]
  },
  {
    id: 6,
    title: "Unit 8, 9 & 10: API & Reporting",
    tagline: "MODEL REPORT EXPORT GATEWAY",
    subtitle: "Secure REST APIs, JWT session authorization, and PDF report exporters.",
    type: "features-grid",
    theme: "cyberpunk",
    features: [
      { title: "RESTful Endpoints", desc: "Decoupled Django views returning normalized JSON outputs for all clean and fit calculations." },
      { title: "JWT Authorization", desc: "Authenticates requests using signed access/refresh tokens to secure user datasets." },
      { title: "PDF Report Exporter", desc: "Uses ReportLab on the backend to dynamically compile trained model parameters and metrics into a PDF." },
      { title: "SQLite3 Persistence", desc: "Reliable database tables storing user profiles and ML model logs locally." }
    ]
  },
  {
    id: 7,
    title: "Project Accomplishments",
    tagline: "KEY UPGRADES & INTEGRATIONS",
    subtitle: "Highlights of the premium LJU syllabus aligned refactoring.",
    type: "bullets",
    theme: "neon-blue",
    points: [
      "Solved Static Dashboard widgets: Dynamic charting scales to any uploaded file.",
      "Universal Dark Navy theme enforced across all views.",
      "Interactive 5-Number summary and Box & Whisker plot visualizers.",
      "Downloadable model training summary reports in standardized PDF format."
    ]
  },
  {
    id: 8,
    title: "Conclusion & QA",
    tagline: "VIVA EXAMINATION TERMINAL",
    subtitle: "Nexora Analytics Platform is fully ready for evaluation.",
    type: "hero",
    theme: "cyberpunk",
    details: [
      { label: "Presenter", value: "Bagadia Krish" },
      { label: "Major", value: "Computer Engineering (CE/IT)" },
      { label: "Status", value: "Completed & Verified" }
    ]
  }
];

function Presentation() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState("next");

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection("next");
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection("prev");
      setCurrentSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "Escape") {
        navigate("/dashboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  return (
    <div className={`cyber-deck-page theme-${slide.theme}`}>
      {/* Decorative animated background elements */}
      <div className="grid-overlay" />
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />
      <div className="glow-orb orb-3" />
      
      {/* Code background lines decorator */}
      <div className="code-background-scroller">
        <code>import pandas as pd</code>
        <code>import numpy as np</code>
        <code>from sklearn.model_selection import train_test_split</code>
        <code>from sklearn.tree import DecisionTreeClassifier</code>
        <code>model = DecisionTreeClassifier(criterion='entropy')</code>
        <code>model.fit(X_train, y_train)</code>
        <code>y_pred = model.predict(X_test)</code>
      </div>

      <header className="cyber-deck-header">
        <button className="cyber-back-btn" onClick={() => navigate("/dashboard")}>
          <FaHome />
          <span>Exit Presentation</span>
        </button>
        <div className="cyber-brand-text">NEXORA INTEL // SLIDES</div>
        <div className="cyber-progress-capsule">
          <span className="current">{String(currentSlide + 1).padStart(2, "0")}</span>
          <span className="divider">/</span>
          <span className="total">{String(slides.length).padStart(2, "0")}</span>
        </div>
      </header>

      <div className="slide-deck-viewport">
        <div className={`cyber-slide-card slide-dir-${direction}`} key={slide.id}>
          {/* Neon corner indicators */}
          <div className="corner-bracket top-left" />
          <div className="corner-bracket top-right" />
          <div className="corner-bracket bottom-left" />
          <div className="corner-bracket bottom-right" />

          <div className="slide-meta">
            <span className="tagline-badge">{slide.tagline}</span>
            <span className="slide-uuid">SYS_LOC_SLIDE_0{slide.id}</span>
          </div>

          <h1 className="slide-title-glitch">{slide.title}</h1>
          <p className="slide-subtitle">{slide.subtitle}</p>

          <div className="slide-body-content">
            {/* HERO SLIDE TYPE */}
            {slide.type === "hero" && (
              <div className="hero-slide-layout">
                <div className="hero-decorations">
                  <div className="decor-line" />
                  <FaRobot className="decor-bot-icon" />
                  <div className="decor-line" />
                </div>
                <div className="hero-details-row">
                  {slide.details.map((detail, idx) => (
                    <div key={idx} className="detail-stat-box">
                      <span className="lbl">{detail.label}</span>
                      <strong className="val">{detail.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROBLEM-SOLUTION TYPE */}
            {slide.type === "problem-solution" && (
              <div className="dual-comparison-layout">
                <div className="comparison-box problem-side">
                  <h3>Legacy Issues</h3>
                  <ul>
                    {slide.problems.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="comparison-box solution-side">
                  <h3>Nexora Solutions</h3>
                  <ul>
                    {slide.solutions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ARCHITECTURE TYPE */}
            {slide.type === "architecture" && (
              <div className="architecture-stepper">
                {slide.layers.map((layer, idx) => (
                  <div key={idx} className="arch-step-row">
                    <div className="step-badge">{idx + 1}</div>
                    <div className="step-details">
                      <strong>{layer.name} <code className="tech-badge">{layer.tech}</code></strong>
                      <p>{layer.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FEATURES GRID TYPE */}
            {slide.type === "features-grid" && (
              <div className="features-neon-grid">
                {slide.features.map((f, idx) => (
                  <div key={idx} className="feature-neon-card">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* DEEP LEARNING TYPE */}
            {slide.type === "deep-learning" && (
              <div className="deep-learning-slide-layout">
                <div className="dl-arch-visual">
                  <h5>Visual Neural Stack</h5>
                  <div className="dl-layers-flow">
                    {slide.layers.map((l, idx) => (
                      <div key={idx} className="dl-flow-node">
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dl-logs-visual">
                  <h5>Live Console Log Feed</h5>
                  <div className="dl-console-view">
                    {slide.logs.map((log, idx) => (
                      <div key={idx} className="console-line">{log}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BULLETS TYPE */}
            {slide.type === "bullets" && (
              <ul className="deck-bullet-list">
                {slide.points.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <footer className="cyber-deck-footer">
        <button 
          onClick={prevSlide} 
          className="cyber-nav-btn" 
          disabled={currentSlide === 0}
        >
          <FaArrowLeft />
          <span>PREV</span>
        </button>

        <div className="cyber-progress-dots">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`cyber-progress-dot ${currentSlide === idx ? "active" : ""}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide} 
          className="cyber-nav-btn" 
          disabled={currentSlide === slides.length - 1}
        >
          <span>NEXT</span>
          <FaArrowRight />
        </button>
      </footer>
    </div>
  );
}

export default Presentation;
