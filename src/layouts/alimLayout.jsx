import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarAlim from "../components/sidebar/sidebarAlim";
import "./alimLayout.css";

function AlimLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    return (
        <div className="alim-layout">
            <SidebarAlim
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <main className="alim-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AlimLayout;