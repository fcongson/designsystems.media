const fs = require("fs");
const path = require("path");

export function getTotalContentDuration() {
  const filePath = path.join(__dirname, "../../data/total-duration.json");
  const content = fs.readFileSync(filePath, "utf8");
  const { totalDuration } = JSON.parse(content);
  return totalDuration;
}
