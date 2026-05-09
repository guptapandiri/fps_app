import { useState } from "react";
import type { CommodityList, Transaction } from "./types";
import "./accordion.css";

interface TransactionsAccordionProps {
  transactions: Transaction[];
  loading: boolean;
}

export function TransactionsAccordion({
  transactions,
  loading,
}: TransactionsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getQty = (t: Transaction, commName: string) => {
    const comm = t.commodityList.find(
      (c: CommodityList) => c.comm_name_en === commName,
    );
    return comm ? comm.sale_qty || 0 : 0;
  };

  return (
    <div className="accordion-wrapper">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title">
          <span>Recent Transactions</span>
        </div>
        <div className="accordion-controls">
          <button
            className="view-all-btn"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            View All
          </button>
          <span className="accordion-icon">{isOpen ? "▼" : "▶"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="accordion-content">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SNo</th>
                  <th>RC No</th>
                  <th>Scheme</th>
                  <th>Receipt No</th>
                  <th>Date & Time</th>
                  <th>Rice (Kg)</th>
                  <th>Sugar (Kg)</th>
                  <th>Amount</th>
                  <th>Port Shop</th>
                 
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row">
                    <td colSpan={9}>Loading transactions...</td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((t, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
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
                      <td>₹{parseFloat(t.amount || "0").toFixed(2)}</td>
                      <td>{t.portCheck}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                      No transactions found for the selected period.
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
