const Papa = require('papaparse');

function auditHiring(columns, rows) {
  const columnsLower = columns.map(c => c.toLowerCase());
  
  // Refined Logic
  const targetCol = columns.find(c => ["hired", "status", "decision"].some(kw => c.toLowerCase().includes(kw))) || 
                    columns.find(c => ["salary", "offered", "pay"].some(kw => c.toLowerCase().includes(kw))) ||
                    columns[columns.length - 1];
  
  const isSalaryTarget = ["salary", "offered", "pay"].some(kw => targetCol.toLowerCase().includes(kw));

  const protectedCol = columns.find(c => ["gender", "race", "ethnicity"].some(kw => c.toLowerCase() === kw)) || 
                       columns.find(c => c.toLowerCase() === "age") || 
                       columns[0];
  
  const isAgeProtected = protectedCol.toLowerCase() === "age";

  console.log("Target Col:", targetCol, "(Salary Based:", isSalaryTarget + ")");
  console.log("Protected Col:", protectedCol, "(Age Based:", isAgeProtected + ")");

  const groups = {};
  rows.forEach(row => {
    let key = String(row[protectedCol]);
    if (isAgeProtected) {
      const age = parseFloat(key);
      if (!isNaN(age)) {
        if (age < 30) key = "Under 30";
        else if (age <= 45) key = "30-45";
        else key = "Over 45";
      }
    }

    const val = row[targetCol];
    if (!groups[key]) groups[key] = { count: 0, selected: 0 };
    groups[key].count++;
    
    let isHired = false;
    if (isSalaryTarget) {
      isHired = parseFloat(val) > 0;
    } else {
      isHired = val === true || val === 1 || ["hired", "accepted", "yes", "approved"].includes(String(val).toLowerCase());
    }
    if (isHired) groups[key].selected++;
  });

  return groups;
}

// Test with user's data structure
const userColumns = ["Candidate_Name", "Age", "Gender", "Ethnicity", "Offered_Salary"];
const userRows = [
  { Candidate_Name: "A", Age: 54, Gender: "Male", Ethnicity: "Majority", Offered_Salary: 216011 },
  { Candidate_Name: "B", Age: 45, Gender: "Female", Ethnicity: "Minority", Offered_Salary: 0 },
  { Candidate_Name: "C", Age: 24, Gender: "Female", Ethnicity: "Minority", Offered_Salary: 69980 },
  { Candidate_Name: "D", Age: 27, Gender: "Male", Ethnicity: "Majority", Offered_Salary: 0 },
];

// Test with Age binning
const ageOnlyColumns = ["Candidate_Name", "Age", "Decision"];
const ageOnlyRows = [
  { Candidate_Name: "A", Age: 25, Decision: "Hired" },
  { Candidate_Name: "B", Age: 35, Decision: "Rejected" },
  { Candidate_Name: "C", Age: 55, Decision: "Hired" },
];

console.log("\n--- Age Binning Test ---");
console.log("Groups:", auditHiring(ageOnlyColumns, ageOnlyRows));
