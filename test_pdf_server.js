const { jsPDF } = require("jspdf");
require("jspdf-autotable");

try {
  const doc = new jsPDF();
  doc.text("Hello Server", 10, 10);
  // @ts-ignore
  doc.autoTable({
    head: [['Test']],
    body: [['Success']]
  });
  const output = doc.output();
  console.log("PDF generated successfully, length:", output.length);
} catch (err) {
  console.error("Error generating PDF on server:", err);
}
