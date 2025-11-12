const fs = require("fs");

// Read CSV files
const solCSV = fs.readFileSync("sol-usd-max.csv", "utf-8");
const suiCSV = fs.readFileSync("sui-usd-max (3).csv", "utf-8");
const hypeCSV = fs.readFileSync("hype-usd-max.csv", "utf-8");

// Parse CSV to get date->price mapping
function parseCSV(csv) {
  const lines = csv.trim().split("\n").slice(1); // Skip header
  const priceMap = {};
  lines.forEach((line) => {
    const [timestamp, price] = line.split(",").slice(0, 2);
    const date = timestamp.split(" ")[0];
    priceMap[date] = parseFloat(price);
  });
  return priceMap;
}

const solPrices = parseCSV(solCSV, "SOL");
const suiPrices = parseCSV(suiCSV, "SUI");
const hypePrices = parseCSV(hypeCSV, "HYPE");

// Get all unique dates
const allDates = new Set([
  ...Object.keys(solPrices),
  ...Object.keys(suiPrices),
  ...Object.keys(hypePrices),
]);

// Create combined JSON object
const historicalData = {};
Array.from(allDates)
  .sort()
  .forEach((date) => {
    const entry = {};
    if (solPrices[date]) entry.SOL = solPrices[date];
    if (suiPrices[date]) entry.SUI = suiPrices[date];
    if (hypePrices[date]) entry.HYPE = hypePrices[date];
    historicalData[date] = entry;
  });

// Ensure output folder exists
if (!fs.existsSync("data")) fs.mkdirSync("data");

// Write JSON file
fs.writeFileSync(
  "data/historical-prices.json",
  JSON.stringify(historicalData, null, 2)
);

const dates = Object.keys(historicalData);
const minDate = new Date(Math.min(...dates.map((d) => new Date(d))));
const maxDate = new Date(Math.max(...dates.map((d) => new Date(d))));

console.log("✅ Successfully converted CSV to JSON!");
console.log("Total dates:", dates.length);
console.log("SOL entries:", Object.keys(solPrices).length);
console.log("SUI entries:", Object.keys(suiPrices).length);
console.log("HYPE entries:", Object.keys(hypePrices).length);
console.log(
  "Date range:",
  minDate.toISOString().split("T")[0],
  "to",
  maxDate.toISOString().split("T")[0]
);
