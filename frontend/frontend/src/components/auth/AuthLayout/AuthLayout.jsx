import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Nexora Analytics</h1>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
