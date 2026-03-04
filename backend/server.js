const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit")

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));



const companyDetails = {
  SG: {
    name: "SG TRANSPORT",
    subtitle: "TRANSPORT CONTRACTOR & CONTAINER SUPPLIERS",
    address: "Office: 03, Neelkanth Deep Plot No.196 Sector 23, Ulwe, Navi Mumbai 410206",
    mobile: "8291471842/8108585807",
    email: "saurabhgadge444@gmail.com",
    bankName: "SARASWAT BANK",
    accountNo: "610000000012951",
    ifsc: "SRCB00000446",
    pan: "DDAPG6320P",
    
  },
  SW: {
    name: "SIDDHESHWAR TRANSPORT",
    subtitle: "TRANSPORT CONTRACTOR & CONTAINER SUPPLIERS",
    address: "Office: 03, Neelkanth Deep Plot No.196 Sector 23, Ulwe, Navi Mumbai 410206",
    mobile: "9820795569/8108585807",
    email: "laxmangadge1234@gmail.com",
    bankName: "IDBI Bank",
    accountNo: "030665380000064",
    ifsc: "IBKL0000306",
    pan: "AIPG3412N",
    
  }
};

function convertNumberToWords(num) {
  if (num === 0) return "Zero";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000)
      return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  }

  return inWords(num).trim();
}

app.post("/generate-pdf", (req, res) => {

console.log("PDFFF recvd")

  const data = req.body;
  const company = companyDetails[data.owner];

  const doc = new PDFDocument({
    size: "A4",
    margin: 40
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

  doc.pipe(res);

  // -------------------
  // COMPANY HEADER
  // -------------------

  doc.fontSize(20).text(company.name, { align: "center" });

  doc.fontSize(11).text(company.subtitle, { align: "center" });

  doc.text(company.address, { align: "center" });

  doc.text(`Mob: ${company.mobile}   Email: ${company.email}`, {
    align: "center"
  });

  doc.moveDown();

  doc.fontSize(16).text("TRANSPORTATION INVOICE", {
    align: "center"
  });

  doc.moveDown();

  // -------------------
  // BILL INFO
  // -------------------

  doc.fontSize(11);

  doc.text(`M/s: ${data.msName}`);
  doc.text(`A/c: ${data.account}`);
  if(data.jobNo){
    doc.text(`JOB No: ${data.jobNo}`);
  }  
  doc.text(`Bill No: ${data.billNo}`);
  doc.text(`Date: ${data.date}`);

  doc.moveDown();

  // -------------------
  // VEHICLE DETAILS
  // -------------------

  (data.vehicles || []).forEach((v, i) => {

    doc.fontSize(11).text(`Vehicle ${i + 1}`);

    doc.text(`Date: ${v.rowDate}`);
    doc.text(`Truck: ${v.truckNo}`);
    doc.text(`Container: ${v.containerNo}`);

    doc.text(`Route: ${v.from} --> ${v.to}`);

    doc.text(`MT Yard: ${v.mtYard}`);

    doc.text(`Weight: ${v.kgs}`);

    doc.text(`Size: ${v.size}`);

    doc.text(`Rate: ₹${Number(v.rate).toLocaleString()}`);

    if(Array.isArray(v.charges)) {
      v.charges.forEach((c) => {
      const label = c.label || "CHARGE";
      const amount = Number(c.amount || 0).toLocaleString();

      doc.text(`${label}:₹${amount}`);

   });
  }

    doc.text(`Advance: ₹${Number(v.advance).toLocaleString()}`);

    doc.text(`Vehicle Total: ₹${Number(v.total).toLocaleString()}`);
    

    doc.moveDown(0.8);
    doc.moveTo(40, doc.y).lineTo(555,doc.y).stroke();
    doc.moveDown();
  });

  // -------------------
  // TOTALS
  // -------------------

  doc.moveDown();

  doc.fontSize(13).text(`Grand Total: ₹${data.grandTotal}`);

  doc.text(`Advance: ₹${data.totalAdvance}`);

  doc.text(`Net Balance: ₹${data.netBalance}`);

  doc.moveDown();

  // -------------------
  // BANK DETAILS
  // -------------------

  doc.fontSize(11).text(`Bank: ${company.bankName}`);

  doc.text(`A/C No: ${company.accountNo}`);

  doc.text(`IFSC: ${company.ifsc}`);

  doc.text(`PAN: ${company.pan}`);

  doc.moveDown();

  doc.text(`Rupees ${convertNumberToWords(data.netBalance)} Only`);

  doc.moveDown();

  doc.text(`For ${company.name}`, { align: "right" });

  doc.text("Proprietor", { align: "right" });

  doc.end();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});


//  app.listen(5000, () => {
//    console.log("Server running on port 5000")
//  });