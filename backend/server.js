const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/generate-pdf", async (req, res) => {
  const invoiceData = req.body;

  const browser = await puppeteer.launch({
    args:["--no-sandbox","--disable-setuid-sandbox"],
    headless:"new"
  });

  const page = await browser.newPage();

  const htmlContent = generateInvoiceHTML(invoiceData);

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "25mm",
      left: "15mm",
      right: "15mm"
    }
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=invoice.pdf"
  });

  res.send(pdfBuffer);
});

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

function generateInvoiceHTML(data) {

    
  const {
    owner,
    billNo,
    date,
    msName,
    account,
    mtYard,
    jobNo,
    vehicles,
    grandTotal,
    totalAdvance,
    netBalance
  } = data;

  const company = companyDetails[owner];

  function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const formattedDate = formatDate(date);

  const vehicleRows = vehicles.map(v => `
    <div class="vehicle-block">
      <div>
        <strong>DATE:</strong> ${formatDate(v.rowDate)}<br/>
        <strong>TRUCK:</strong> ${v.truckNo}<br/>
        <strong>CONT NO:</strong> ${v.containerNo}
      </div>

      <div>
        
        <strong>ROUTE:</strong> ${v.from} → ${v.to}<br/>
        ${v.mtYard ?`<strong>MTYARD :</strong> ${v.mtYard}<br>`:""}
        <strong>WEIGHT:</strong> ${v.kgs} <br/>
        <strong>SIZE:</strong> ${v.size}
      </div>

      <div class="finance">
      <div><strong>RATE:</strong> ₹${v.rate}</div>
        
        
       ${v.charges.map(c => `
  <div>
    ${
      c.label === "OTHER"
        ? `${c.customLabel || "OTHER"}: ₹${c.amount}`
        : `${c.label}: ₹${c.amount}`
    }
  </div>
`).join("")}
        <div><strong>ADVANCE:</strong> ₹${v.advance}</div>
        <div class="short-line"></div>
        <div class="total"><strong>Total:</strong> ₹${v.total}</div>
      </div>
    </div>
  `).join("");

  return `
  <html>
  <head>


    <style>
    body {
  font-family: "Arial Helvetica, sans-serif";
  font-size: 14px;
  margin: 0;

  
}

.page{
display:flex;
flex-direction:column;
min-height:90vh;
}

.invoice-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 237mm; /* A4 printable height after margins */
  padding: 5px;
border-bottom: 1px solid black;
  border-left: 1px solid black;
  border-right: 1px solid black;
  border-top: 1px solid black;
}

.content{
flex:1;
}


.invoice-header {
  text-align: center;
  border-bottom: 1px solid black;
  border-top: 0px solid black;
  padding: 10px 8px;
}

.company-name {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 1px;
}


.company-subtitle {
  font-size: 14px;
  margin-top: 4px;
}

.company-address {
  font-size: 13px;
  margin-top: 3px;
}

.company-contact {
  font-size: 13px;
  margin-top: 3px;
}

.invoice-title {
  margin-top: 8px;
  font-size: 18px;
  font-weight: bold;
  border-top: 1px  black;
  border-top-style: dotted;
  padding-top: 6px;
}

.info {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  padding: 8px 0;
  margin-bottom: 10px;
}

.invoice-info {
  display: table;
  width: 100%;
  border-bottom: 1px solid black;
  font-size: 14px;
}

.invoice-info > div {
  display: table-cell;
  width: 33.33%;
  padding: 4px 6px;
  vertical-align: top;
}

.info-left {
  text-align: left;
}

.info-center {
  text-align: center;
}

.info-right {
  text-align: right;
}


.vehicle-block {
  display: grid;
  grid-template-columns: 25% 55% 20%;
  margin-top: 5px;
}

.finance {
  text-align: right;
}


.short-line{
width:120px;
border-top:1px dotted rgb(149, 149, 149);
margin : 4px 0 4px auto;
}

.vehicle-block:not(:last-child){
border-bottom:1px dotted rgb(168, 166, 166); }



.footer {
  border-top: 2px solid black;
  padding-top: 10px;
  text-align: right;
  font-weight: bold;
  border-bottom: 1px solid black;
}



.footer-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.footer-table td {
  border: 1px solid black;
  padding: 6px;
  vertical-align: top;
}

.invoice-footer{
page-break-inside: avoid;
margin-top:auto;
}

.bank-cell {
  width: 35%;
}

.gst-cell {
  width: 40%;
}


.total-cell {
  width: 25%;
  font-weight: bold;
}

.total-cell div {
  display: flex;
  justify-content: space-between;
}

.amount-words {
  border-left: 1px solid black;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  padding: 6px;
  font-size: 13px;
}

.signature {
  text-align: right;
  margin-top: 5px;
}
  </style>


  </head>
  <body>
  <div class="invoice-wrapper">
  <div class="page">

    <div class="invoice-header">

  <div class="company-name">${company.name}</div>

  <div class="company-subtitle">
    ${company.subtitle}
  </div>

  <div class="company-address">
    ${company.address}
  </div>

  <div class="company-contact">
    Mob : ${company.mobile}
    &nbsp;&nbsp;&nbsp;
    Email : ${company.email}
  </div>

  <div class="invoice-title">
    TRANSPORTATION INVOICE
  </div>

</div>




<div class="invoice-info">

  <!-- LEFT -->
  <div class="info-left">
    <div><strong>M/s :</strong> ${msName}</div>
    <div><strong>A/c :</strong> ${account}</div>
  </div>

  <!-- CENTER -->
  <div class="info-center">  
${jobNo ? `<div><strong>JOB NO :</strong> ${jobNo}</div>` : ""}  
  </div>

  <!-- RIGHT -->
  <div class="info-right">
    <div><strong>BILL NO :</strong> ${billNo}</div>
    <div><strong>DATE :</strong> ${formattedDate}</div>
  </div>

</div>



    <div class="content">
      ${vehicleRows}
    </div>

    <div class="invoice-footer">

  <table class="footer-table">
    <tr>
      <td class="bank-cell">
        
        Bank Name: ${company.bankName}<br/>
        A/C No: ${company.accountNo}<br/>
        IFSC Code: ${company.ifsc}
      </td>

      <td class="gst-cell">
        GST PAYABLE &nbsp;&nbsp; E. & O. E <br>
        CONSIGNOR<br/>
        CONSIGNEE &nbsp;&nbsp;PAN NO- ${company.pan}
      </td>

     

      <td class="total-cell">
        <div><strong>TOTAL</strong> &nbsp; ₹${grandTotal}</div>
        <div><strong>ADVANCE</strong> &nbsp; ₹${totalAdvance}</div>
        <div><strong>NETT.BAL</strong> &nbsp; ₹${netBalance}</div>
      </td>
    </tr>
  </table>

  <div class="amount-words">
    Rupees ${convertNumberToWords(Math.round(netBalance))} Only
  </div>

  <div class="signature">
    For ${company.name}<br/><br/>
    Proprietor
  </div>

</div>

  </div>
  
  </div> 
</body>
  </html>
  `;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});