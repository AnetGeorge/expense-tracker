import Sidebar from "../components/Sidebar";
import EmployeeCards from "../components/EmployeeCards";
export default function Employees() {
  

  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
  <h2 className="h-title"></h2>
  <EmployeeCards />
      </div>
    </div>
  );
}
