import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";

function Transport() {
  const [owner, setOwner] = useState("SW");
  const [date, setDate] = useState("");
  const [billNo, setBillNo] = useState("");
  const [msName, setMsName] = useState("");
  const [account, setAccount] = useState("");
  
  const [jobNo, setJobNo] = useState("");

  const [vehicles, setVehicles] = useState([]);

  const chargeOptions = ["TEA", "UNLOADING", "FREIGHT", "LOADING", "PARKING", "OTHER"];

  // ---------- FY + BILL ----------
  const getFY = (selectedDate) => {
    if (!selectedDate) return "";
    const d = new Date(selectedDate);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    let startYear, endYear;
    if (month >= 4) {
      startYear = year;
      endYear = year + 1;
    } else {
      startYear = year - 1;
      endYear = year;
    }

    return `${String(startYear).slice(2)}-${String(endYear).slice(2)}`;
  };

  const generateBillNo = (selectedOwner, selectedDate) => {
    const fy = getFY(selectedDate);
    if (!fy) return "";

    const key = `${selectedOwner}_${fy}`;
    const stored = JSON.parse(localStorage.getItem("billCounters") || "{}");

    const nextNumber = (stored[key] || 0) + 1;
    stored[key] = nextNumber;
    localStorage.setItem("billCounters", JSON.stringify(stored));

    const padded = String(nextNumber).padStart(2, "0");
    return `${selectedOwner}|${fy}|${padded}`;
  };



  // ---------- VEHICLE ----------
  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        id: Date.now(),
        rowDate: date,
        truckNo: "",
        containerNo: "",
        from: "",
        to: "",
        mtYard:"",
        kgs: "",
        size: "",
        advance: "",
        mt: "",
        kata: "",
        rate: "",
        charges: [],
        expanded: true,
      },
    ]);
  };

  const updateVehicle = (id, field, value) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  const addCharge = (id) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id && v.charges.length < 5
          ? { ...v, charges: [...v.charges, { label: "", amount: "" }] }
          : v
      )
    );
  };

  const updateCharge = (vehicleId, index, field, value) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const updated = [...v.charges];
          updated[index][field] = value;
          return { ...v, charges: updated };
        }
        return v;
      })
    );
  };

  const removeCharge = (vehicleId, index) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            charges: v.charges.filter((_, i) => i !== index),
          };
        }
        return v;
      })
    );
  };

  const toggleExpand = (id) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, expanded: !v.expanded } : v
      )
    );
  };

  const removeVehicle = (id) => {
    if (window.confirm("Remove this vehicle?")) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const getRowTotal = (v) => {
    const chargeTotal = v.charges.reduce(
      (sum, c) => sum + Number(c.amount || 0),
      0
    );
    return (
  Number(v.rate || 0) +
  Number(v.kata || 0) +
  Number(v.mt || 0) +
  chargeTotal
);
  };

  const grandTotal = vehicles.reduce(
    (sum, v) => sum + getRowTotal(v),
    0
  );

  const totalAdvance = vehicles.reduce(
    (sum, v) => sum + Number(v.advance || 0),
    0
  );

  const netBalance = grandTotal - totalAdvance;


const handleReset = () => {

  if (!window.confirm("Clear all entered data?")) return;

  setOwner("SW");
  setDate("");
  setBillNo("");
  setMsName("");
  setAccount("");
  setJobNo("");
  setVehicles([]);

};



const handleDownloadPDF = async () => {
  const toastId = toast.loading("Bill downloading....");
  toast.success("Bill downloaded. Uploading to Drive...", { id: toastId });
  try {
    //const response = await fetch("https://transport-print.onrender.com/generate-pdf", {
    const response = await fetch("http://localhost:5000/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        owner,
        billNo,
        date,
        msName,
        account,
        jobNo,
        vehicles: vehicles.map(v => ({
          ...v,
          charges: v.charges.map(c =>({
            label:
            c.label ==="OTHER"
             ? (c.customLabel && c.customLabel.trim() !==
             ""? c.customLabel: "OTHER")
             :(c.label || "CHARGE"),
            amount: Number(c.amount||0)
          })),
          total: getRowTotal(v)
        })),
        grandTotal,
        totalAdvance,
        netBalance,
      }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${billNo}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Failed to generate or upload bill", { id: toastId });
  }
};







  return (
    <div className="container">
      <h1>🚛 Transport Billing </h1>



<div style={{ textAlign: "right", marginBottom: "5px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>

    <button className="reset-btn" onClick={handleReset} title="Reset Form">
    <FiRefreshCw />
  </button>

  <button className="print-btn" onClick={handleDownloadPDF}>
    📄 Download/Upload Bill
  </button>


</div>


    {/* PRINT INVOICE LAYOUT */}
<div className="print-invoice">
  
  <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
    {owner === "SG" ? "SG Transport" : "Siddheshwar Transport"}
  </h2>
<div className="print-company">
  <div>Address: Your Company Address Here</div>
  <div>Contact: 9876543210</div>
  <div>Email: example@email.com</div>
</div>

  <div className="print-header">
    <div><strong>Bill No:</strong> {billNo}</div>
    <div><strong>Date:</strong> {date}</div>
    <div><strong>M/s:</strong> {msName}</div>
    <div><strong>A/c:</strong> {account}</div>
    
    <div><strong>JOB NO:</strong> {jobNo}</div>
  </div>





<div className="print-vehicles">
{vehicles.map((v, index) => (
  <div key={index} className="vehicle-block">

    {/* LEFT */}
    <div className="vehicle-left">
      <div><strong>Date:</strong> {v.rowDate}</div>
      <div><strong>Truck No:</strong> {v.truckNo}</div>
    </div>

    {/* MIDDLE */}
    <div className="vehicle-middle">
      <div><strong>Container No:</strong> {v.containerNo}</div>
      <div><strong>Route:</strong> {v.from} → {v.to}</div>
      <div><strong>MT YARD:</strong> {v.mtYard}</div>
      <div><strong>Weight:</strong> {v.kgs}</div>
      <div><strong>Size:</strong> {v.size}</div>
    </div>

    {/* RIGHT */}
    <div className="vehicle-right">

      <div className="finance-row bold">
        <span>Advance:</span>
        <span>₹{v.advance}</span>
      </div>



    <div className="finance-row charges-label">
  <span>Charges:</span>
  <span></span>
</div>

      {v.charges.map((c, i) => (
        <div key={i} className="finance-row">
          <span>{c.label}:</span>
          <span>₹{c.amount}</span>
        </div>
      ))}

     <div className="rate-dotted-line"></div>

      <div className="finance-row">
        <span>Rate:</span>
        <span>₹{v.rate}</span>
      </div>

      <div className="rate-solid-line"></div>

      <div className="finance-row total-row">
        <span>Vehicle Total:</span>
        <span>₹{getRowTotal(v)}</span>
      </div>

    </div>

    <div className="vehicle-separator"></div>
  </div>
))}

</div>


 

<div className="print-footer-summary">
  <div className="footer-row">
    <span>Grand Total:</span>
    <span>₹{grandTotal}</span>
  </div>
  <div className="footer-row">
    <span>Total Advance:</span>
    <span>₹{totalAdvance}</span>
  </div>
  <div className="footer-row net-balance">
    <span>Net Balance:</span>
    <span>₹{netBalance}</span>
  </div>
</div>



</div>


      {/* HEADER */}
      <div className="header-grid">
        <div className="field">
          <label>Owner</label>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="SW">Siddheshwar Transport</option>
            <option value="SG">SG</option>
            
          </select>
        </div>

        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="field">
          <label>Bill No</label>
          <input value={billNo} onChange={(e) => setBillNo(e.target.value)} />
        </div>

        <div className="field">
          <label>M/s</label>
          <input value={msName} onChange={(e) => setMsName(e.target.value.toUpperCase())} />
        </div>

        <div className="field">
          <label>A/c</label>
          <input value={account} onChange={(e) => setAccount(e.target.value.toUpperCase())} />
        </div>
      
        <div className="field">
          <label>JOB NO</label>
          <input value={jobNo} onChange={(e) => setJobNo(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: "25px" }}>
        <button className="primary-btn" onClick={addVehicle}>
          ➕ Add Vehicle
        </button>
      </div>

      {vehicles.map((v, index) => (
        <div key={v.id} className="vehicle-card">
          <div className="vehicle-header">
            <strong>SR {index + 1}</strong>
            <span>{v.truckNo || "No Truck No"}</span>
            <span>₹{getRowTotal(v)}</span>
            <div>
              <button onClick={() => toggleExpand(v.id)}>
                {v.expanded ? "▲" : "▼"}
              </button>
              <button onClick={() => removeVehicle(v.id)}>🗑</button>
            </div>
          </div>

          {v.expanded && (
            <>
              {/* BASIC GRID */}
              <div className="vehicle-body">

                <div className="field">
                  <label>Date</label>
                  <input type="date" value={v.rowDate}
                    onChange={(e) => updateVehicle(v.id, "rowDate", e.target.value)} />
                </div>

                <div className="field">
                  <label>Truck No</label>
                  <input value={v.truckNo}
                    onChange={(e) => updateVehicle(v.id, "truckNo", e.target.value.toUpperCase())} />
                </div>

                <div className="field">
                  <label>Container No</label>
                  <input value={v.containerNo}
                    onChange={(e) => updateVehicle(v.id, "containerNo", e.target.value.toUpperCase())} />
                </div>

                <div className="field">
                  <label>From</label>
                  <input value={v.from}
                    onChange={(e) => updateVehicle(v.id, "from", e.target.value.toUpperCase())} />
                </div>

                <div className="field">
                  <label>To</label>
                  <input value={v.to}
                    onChange={(e) => updateVehicle(v.id, "to", e.target.value.toUpperCase())} />
                </div>

                 <div className="field">
                  <label>MT YARD</label>
                  <input value={v.mtYard} 
                  onChange={(e) => updateVehicle(v.id,"mtYard",e.target.value.toUpperCase())} />
                </div>

                <div className="field">
                  <label>KGS</label>
                  <input value={v.kgs}
                    onChange={(e) => updateVehicle(v.id, "kgs", e.target.value)} />
                </div>

                <div className="field">
                  <label>Size</label>
                  <input value={v.size}
                    onChange={(e) => updateVehicle(v.id, "size", e.target.value)} />
                </div>

                <div className="field">
                  <label>Advance</label>
                  <input type="number" value={v.advance}
                    onChange={(e) => updateVehicle(v.id, "advance", e.target.value)} />
                </div>

                <div className="field">
                  <label>MT</label>
                  <input type="number" value={v.mt}
                    onChange={(e) => updateVehicle(v.id, "mt", e.target.value)} />
                </div>

                <div className="field">
                  <label>KATA</label>
                  <input type="number" value={v.kata}
                    onChange={(e) => updateVehicle(v.id, "kata", e.target.value)} />
                </div>

                <div className="field">
                  <label>Rate</label>
                  <input type="number" value={v.rate}
                    onChange={(e) => updateVehicle(v.id, "rate", e.target.value)} />
                </div>

              </div>

              {/* CHARGES */}
             <div className="charges-section">
  <h4>Charges</h4>

  {v.charges.map((charge, i) => (
    <div key={i} className="charge-row">

      {/* Dropdown */}
      <select
        value={charge.label}
        onChange={(e) =>
          updateCharge(v.id, i, "label", e.target.value)
        }
      >
        <option value="">Select</option>
        {chargeOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Custom Label Input (only when OTHER selected) */}
      {charge.label === "OTHER" && (
        <input
          type="text"
          placeholder="Enter Charge Name"
          value={charge.customLabel || ""}
          onChange={(e) =>
            updateCharge(
              v.id,
              i,
              "customLabel",
              e.target.value.toUpperCase()
            )
          }
        />
      )}

      {/* Amount Input */}
      <input
        type="number"
        value={charge.amount}
        onChange={(e) =>
          updateCharge(v.id, i, "amount", e.target.value)
        }
      />

      {/* Remove Button */}
      <button
        className="remove-charge-btn"
        onClick={() => removeCharge(v.id, i)}
      >
        ✖
      </button>
    </div>
  ))}

  {v.charges.length < 5 && (
    <button
      className="add-charge-btn"
      onClick={() => addCharge(v.id)}
    >
      ➕ Add Charge
    </button>
  )}
</div>
            </>
          )}
        </div>
      ))}

      {vehicles.length > 0 && (
        <div className="summary-card">
          
          <h2>Grand Total: ₹{grandTotal}</h2>
          <h3>Total Advance: ₹{totalAdvance}</h3>
          <h2 style={{ color: netBalance < 0 ? "red" : "white" }}>
            Net Balance: ₹{netBalance}
          </h2>
        </div>
      )}
    </div>
  );
}


export default Transport;
