import {
  HashRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./styles/design-tokens.css";
import "./styles/index.css";
import RouteList from "./pages/RouteList";
import RouteEditor from "./pages/RouteEditor";

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditor = location.pathname.startsWith("/routes");

  return (
    <div className="app-shell">
      {!isEditor && (
        <header className="app-header">
          <div className="app-logo">
            <span className="app-title">兴诚电瓷 IMS</span>
            <span className="app-subtitle">智造管理系统 v0.1.0</span>
          </div>
          <nav className="app-nav">
            <button className="nav-btn" onClick={() => navigate("/")}>
              总览
            </button>
            <button className="nav-btn">生产</button>
            <button
              className="nav-btn nav-btn--active"
              onClick={() => navigate("/routes")}
            >
              工艺
            </button>
            <button className="nav-btn">库存</button>
            <button className="nav-btn">质量</button>
            <button className="nav-btn">设备</button>
          </nav>
          <div className="app-status">
            <span className="status-indicator status-indicator--online" />
            <span className="status-text">本地运行</span>
          </div>
        </header>
      )}

      <main className={`app-main ${isEditor ? "app-main--full" : ""}`}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/routes" element={<RouteList />} />
          <Route path="/routes/:id" element={<RouteEditor />} />
        </Routes>
      </main>
    </div>
  );
}

function WelcomePage() {
  return (
    <section className="welcome-section">
      <h1 className="welcome-title">Welcome to 兴诚电瓷 IMS</h1>
      <p className="welcome-desc">
        电瓷智造全流程管理系统 — 制泥 → 成型 → 修坯 → 上釉 → 烧成 → 胶装 → 试验
        → 包装
      </p>
      <div className="quick-stats">
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">今日订单</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">在产批次</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">待检品</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">库存预警</span>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
