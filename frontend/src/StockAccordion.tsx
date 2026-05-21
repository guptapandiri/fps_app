import { useState } from "react";
import type { StockRegisterEntry } from "./types";
import "./accordion.css";

interface StockAccordionProps {
  stockEntries: StockRegisterEntry[];
  loading: boolean;
}

export function StockAccordion({
  stockEntries,
  loading,
}: StockAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-wrapper">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title">
          <span>Other Stock</span>
        </div>
        <div className="accordion-controls">
          <span className="accordion-icon">{isOpen ? "▼" : "▶"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="accordion-content">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Opening Bal</th>
                  <th>Receipts</th>
                  <th>Total Stock</th>
                  <th>Issued</th>
                  <th>Closing Bal</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row">
                    <td colSpan={6}>Loading...</td>
                  </tr>
                ) : stockEntries.length > 0 ? (
                  stockEntries.map((s, idx) => (
                    <tr key={`${s.type ?? "NA"}-${s.commId}-${idx}`}>
                      <td>
                        <strong>{s.commNameEn}</strong>
                      </td>
                      <td>{s.ob.toFixed(3)}</td>
                      <td>{s.receivedQty.toFixed(3)}</td>
                      <td>{(s.ob + s.receivedQty + s.extraRo + s.sixaCase).toFixed(3)}</td>
                      <td style={{ color: "var(--success)", fontWeight: "600" }}>
                        {s.issuedQty.toFixed(3)}
                      </td>
                      <td style={{ fontWeight: "700" }}>{s.cb.toFixed(3)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                      No stock found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
