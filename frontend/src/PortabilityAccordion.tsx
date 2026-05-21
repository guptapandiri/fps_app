import { useState } from "react";
import "./accordion.css";

interface PortabilityRow {
  portCheck: string;
  count: number;
  totalAmount: number;
}

interface PortabilityAccordionProps {
  portabilityRows: PortabilityRow[];
  loading: boolean;
}

export function PortabilityAccordion({
  portabilityRows,
  loading,
}: PortabilityAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-wrapper">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title">
          <span>Other Portability</span>
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
                  <th>Type</th>
                  <th>Port Check</th>
                  <th>Transactions</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row">
                    <td colSpan={4}>Loading...</td>
                  </tr>
                ) : portabilityRows.length > 0 ? (
                  portabilityRows.map((row) => {
                    const isSelf = row.portCheck.toLowerCase() === "self";

                    return (
                      <tr key={row.portCheck}>
                        <td>
                          <span
                            className={`badge ${isSelf ? "badge-success" : "badge-info"}`}
                          >
                            {isSelf ? "Self" : "Other Shop"}
                          </span>
                        </td>
                        <td>{row.portCheck}</td>
                        <td>{row.count}</td>
                        <td>₹{row.totalAmount.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                      No other portability data found.
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
