import { useState, useEffect } from "react";
import { mockShopDetails } from "./mockData";
import { getStockApiUrl, getTransactionsApiUrl } from "./utils/api";
import type { CommodityList, StockRegisterEntry, Transaction } from "./types";
import { TransactionsAccordion } from "./TransactionsAccordion";
import { StockAccordion } from "./StockAccordion";
import "./App.css";
import "./accordion.css";

const REQUEST_TIMEOUT_MS = 12000;

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stockEntries, setStockEntries] = useState<StockRegisterEntry[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);
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
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    let isCancelled = false;

    const fetchJson = async <T,>(url: string, errorMessage: string) => {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(errorMessage);
      }
      return (await response.json()) as T;
    };

    const getFetchError = (
      result: PromiseRejectedResult,
      fallbackMessage: string,
    ) => {
      if (
        result.reason instanceof DOMException &&
        result.reason.name === "AbortError"
      ) {
        return "Data request timed out. Public CORS proxies may be unavailable. Configure VITE_PROD_API_URL/VITE_PROD_STOCK_API_URL with your own proxy endpoint.";
      }

      if (result.reason instanceof Error && result.reason.message) {
        return result.reason.message;
      }

      return fallbackMessage;
    };

    const fetchDashboardData = async () => {
      setTransactionsLoading(true);
      setStockLoading(true);
      try {
        const [transactionsResult, stockResult] = await Promise.allSettled([
          fetchJson<Transaction[]>(
            getTransactionsApiUrl(),
            "Failed to fetch transaction data",
          ),
          fetchJson<StockRegisterEntry[]>(
            getStockApiUrl(),
            "Failed to fetch stock summary data",
          ),
        ]);

        if (isCancelled) {
          return;
        }

        const errors: string[] = [];

        if (transactionsResult.status === "fulfilled") {
          setTransactions(transactionsResult.value);
        } else {
          console.error("Error fetching transactions:", transactionsResult.reason);
          errors.push(
            getFetchError(
              transactionsResult,
              "Could not load live transaction data.",
            ),
          );
        }

        if (stockResult.status === "fulfilled") {
          setStockEntries(stockResult.value);
        } else {
          console.error("Error fetching stock summary:", stockResult.reason);
          errors.push(
            getFetchError(stockResult, "Could not load live stock summary."),
          );
        }

        setError(errors.length > 0 ? errors.join(" ") : null);
      } finally {
        window.clearTimeout(timeoutId);
        if (!isCancelled) {
          setTransactionsLoading(false);
          setStockLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isCancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const TODAY_STR = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD" 

  const todayTransactions = transactions.filter((t) =>
    t.loginTime.startsWith(TODAY_STR),
  );

  const getQty = (t: Transaction, commName: string) => {
    const comm = t.commodityList.find(
      (c: CommodityList) => c.comm_name_en === commName,
    );
    return comm ? comm.sale_qty || 0 : 0;
  };

  const totalRiceToday = todayTransactions.reduce(
    (acc, curr) => acc + getQty(curr, "FRice"),
    0,
  );

  const totalRiceMonth = transactions.reduce(
    (acc, curr) => acc + getQty(curr, "FRice"),
    0,
  );
  const riceStock = stockEntries.find(
    (s) => s.commNameEn === "FRice" && s.type?.toUpperCase() === "PDS",
  );
  const riceClosingBalance = riceStock?.cb ?? 0;

  const activeStock = stockEntries.filter((s) => s.receivedQty > 0);
  const otherStock = stockEntries.filter((s) => s.receivedQty <= 0);

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
          <div className="stat-card info">
            <span className="stat-label">Rice Distributed (Today)</span>
            <div className={`stat-value ${transactionsLoading ? "is-loading" : ""}`}>
              {transactionsLoading ? "Loading..." : `${totalRiceToday} Kgs`}
            </div>
            <small style={{ color: "var(--text-muted)" }}>
              {transactionsLoading ? "Month: Loading..." : `Month: ${totalRiceMonth} Kgs`}
            </small>
          </div>
          <div className="stat-card warning">
            <span className="stat-label">Transactions (Today)</span>
            <div className={`stat-value ${transactionsLoading ? "is-loading" : ""}`}>
              {transactionsLoading ? "Loading..." : todayTransactions.length}
            </div>
            <small style={{ color: "var(--text-muted)" }}>
              {transactionsLoading ? "Total Month: Loading..." : `Total Month: ${transactions.length}`}
            </small>
          </div>
          <div className="stat-card">
            <span className="stat-label">Closing Balance (Rice)</span>
            <div className={`stat-value ${stockLoading ? "is-loading" : ""}`}>
              {stockLoading ? "Loading..." : `${riceClosingBalance.toFixed(3)} Kgs`}
            </div>
            <small style={{ color: "var(--text-muted)" }}>
              Target: 2000 Kgs
            </small>
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
                  <th>Received (Kg)</th>
                  <th>Sales (Kg)</th>
                  <th>Closing Bal (Kg)</th>
                </tr>
              </thead>
              <tbody>
                {stockLoading ? (
                  <tr className="loading-row">
                    <td colSpan={6}>Loading stock summary...</td>
                  </tr>
                ) : activeStock.length > 0 ? (
                  activeStock.map((s, idx) => (
                    <tr key={`${s.type ?? "NA"}-${s.commId}-${idx}`}>
                      <td>
                        <strong>{s.commNameEn}</strong>
                      </td>
     
                      <td>{s.receivedQty.toFixed(3)}</td>
                      <td style={{ color: "var(--success)", fontWeight: "600" }}>
                        {s.issuedQty.toFixed(3)}
                      </td>
                      <td style={{ fontWeight: "700" }}>{s.cb.toFixed(3)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No active stock for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other Stock Accordion */}
        {otherStock.length > 0 && (
          <StockAccordion stockEntries={otherStock} loading={stockLoading} />
        )}

        {/* Transactions Accordion */}
        <TransactionsAccordion
          transactions={transactions}
          loading={transactionsLoading}
        />

      </main>
    </div>
  );
}

export default App;
