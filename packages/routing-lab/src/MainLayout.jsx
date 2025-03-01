// MainLayout.jsx
import { Header } from "./Header.jsx";
import { Outlet } from "react-router"; // Add this import

export function MainLayout() {
  return (
    <div>
      <Header />
      <div style={{padding: "0 2em"}}>
        <Outlet /> {/* Replace props.children with Outlet */}
      </div>
    </div>
  );
}