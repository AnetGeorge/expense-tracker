import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/dashboard.css";
import ManaIllustration from "../mana.png";
import RecentRequests from "../components/RecentRequests";
import DeptDonut from "../components/DeptDonut";
import CategoryDonut from "../components/CategoryDonut";

export default function ManagerDashboard() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Topbar />

        <h1 className="page-title">Hello Manager 👋</h1>
        <p className="subtitle">
          Another day, another opportunity to keep the company thriving!
        </p>

        <div className="banner">
          <div>
            <h3>Let’s get productive!</h3>
            <p>Another day, another opportunity to keep things moving!</p>
          </div>

          <img src={ManaIllustration} alt="manager" className="banner-img" />
        </div>

        <div className="chart-row">
          <div className="chart-card">
            <h2>Recent Requests</h2>
            <RecentRequests />
          </div>

          <div className="chart-card small">
            <h2>Dept Overview (by Category)</h2>
            <CategoryDonut />
          </div>
        </div>
      </div>
    </div>
  );
}
