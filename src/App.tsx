import { useState, useEffect } from "react";
import { mockStock, mockShopDetails } from "./mockData";
import { getApiUrl } from "./utils/api";
import type { CommodityList, Transaction } from "./types";
import "./App.css";

const REQUEST_TIMEOUT_MS = 12000;

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, REQUEST_TIMEOUT_MS);

      try {
        setLoading(true);
        const url = getApiUrl();
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Failed to fetch transaction data");
        }

        const data = await response.json();
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (err instanceof DOMException && err.name === "AbortError") {
          setError(
            "Data request timed out. Public CORS proxies may be unavailable. Configure VITE_PROD_API_URL with your own proxy endpoint.",
          );
        } else {
          setError("Could not load live data. Please check your connection.");
        }
      } finally {
        window.clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const TODAY_STR = "2026-05-05"; // Based on session context

  const todayTransactions = transactions.filter((t) =>
    t.loginTime.startsWith(TODAY_STR),
  );

  const getQty = (t: Transaction, commName: string) => {
    const comm = t.commodityList.find(
      (c: CommodityList) => c.comm_name_en === commName,
    );
    return comm ? comm.sale_qty || 0 : 0;
  };

  // Metrics for TODAY
  const totalSalesToday = todayTransactions.reduce(
    (acc, curr) => acc + parseFloat(curr.amount || "0"),
    0,
  );
  const totalRiceToday = todayTransactions.reduce(
    (acc, curr) => acc + getQty(curr, "FRice"),
    0,
  );

  // Metrics for MONTH (Full dataset)
  const totalSalesMonth = transactions.reduce(
    (acc, curr) => acc + parseFloat(curr.amount || "0"),
    0,
  );
  const totalRiceMonth = transactions.reduce(
    (acc, curr) => acc + getQty(curr, "FRice"),
    0,
  );

  if (loading) {
    return (
      <div
        className="dashboard-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>Loading Shop Data...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className="menu-btn"
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
        >
          ☰
        </button>
        <span style={{ fontWeight: 700, color: "var(--secondary)" }}>
          FPS PORTAL
        </span>
        <div style={{ width: "24px" }}></div>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>FPS Portal</h2>
          {isSidebarOpen && (
            <button
              className="menu-btn"
              style={{ color: "white" }}
              onClick={closeSidebar}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          )}
        </div>
        <ul className="nav-links">
          <li
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              closeSidebar();
            }}
          >
            <span>Dashboard</span>
          </li>
          <li
            className={`nav-item ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("transactions");
              closeSidebar();
            }}
          >
            <span>Transactions</span>
          </li>
          <li
            className={`nav-item ${activeTab === "stock" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("stock");
              closeSidebar();
            }}
          >
            <span>Stock Status</span>
          </li>
          <li className="nav-item">
            <span>Reports</span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header-bar">
          <div>
            <h1>FPS Shop Dashboard</h1>
            <p style={{ textAlign: "left", color: "var(--text-muted)" }}>
              Welcome back, {mockShopDetails.ownerName}
            </p>
          </div>
          <div className="shop-info-badge">
            <strong>Shop ID:</strong> {mockShopDetails.fpsId} |{" "}
            <strong>Location:</strong> {mockShopDetails.location}
          </div>
        </header>

        {error && (
          <div
            style={{
              background: "#fff3cd",
              color: "#856404",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #ffeeba",
            }}
          >
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card success">
            <span className="stat-label">Total Sales (Today)</span>
            <div className="stat-value">₹{totalSalesToday.toFixed(2)}</div>
            <small style={{ color: "var(--text-muted)" }}>
              Month: ₹{totalSalesMonth.toFixed(2)}
            </small>
          </div>
          <div className="stat-card info">
            <span className="stat-label">Rice Distributed (Today)</span>
            <div className="stat-value">{totalRiceToday} Kgs</div>
            <small style={{ color: "var(--text-muted)" }}>
              Month: {totalRiceMonth} Kgs
            </small>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Transactions (Today)</span>
            <div className="stat-value">{todayTransactions.length}</div>
            <small style={{ color: "var(--text-muted)" }}>
              Total Month: {transactions.length}
            </small>
          </div>
          <div className="stat-card">
            <span className="stat-label">Closing Balance (Rice)</span>
            <div className="stat-value">1410.50 Kgs</div>
            <small style={{ color: "var(--text-muted)" }}>
              Target: 2000 Kgs
            </small>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="card">
          <div className="card-title">
            <span>Recent Transactions</span>
            <button
              style={{
                padding: "5px 10px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              View All
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>RC No</th>
                  <th>Scheme</th>
                  <th>Receipt No</th>
                  <th>Date & Time</th>
                  <th>Rice (Kg)</th>
                  <th>Sugar (Kg)</th>
                  <th>Atta (Pkt)</th>
                  <th>Amount</th>
                  <th>Auth Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{t.existingRcNumber}</strong>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {t.schemeShortName}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.75rem" }}>{t.receiptId}</td>
                      <td>{t.loginTime}</td>
                      <td>{getQty(t, "FRice")}</td>
                      <td>{getQty(t, "SUGAR HALF KG")}</td>
                      <td>{getQty(t, "WM Atta Pkt")}</td>
                      <td>₹{parseFloat(t.amount || "0").toFixed(2)}</td>
                      <td>
                        <span className="badge badge-success">
                          {t.transTime}s
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No transactions found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Status Card */}
        <div className="card">
          <div className="card-title">Stock Summary (Current Month)</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Opening Bal (Kg)</th>
                  <th>Receipts (Kg)</th>
                  <th>Total Stock (Kg)</th>
                  <th>Sales (Kg)</th>
                  <th>Closing Bal (Kg)</th>
                </tr>
              </thead>
              <tbody>
                {mockStock.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{s.commodity}</strong>
                    </td>
                    <td>{s.openingBalance.toFixed(3)}</td>
                    <td>{s.receipts.toFixed(3)}</td>
                    <td>{s.totalStock.toFixed(3)}</td>
                    <td style={{ color: "var(--success)", fontWeight: "600" }}>
                      {s.sales.toFixed(3)}
                    </td>
                    <td style={{ fontWeight: "700" }}>
                      {s.closingBalance.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
