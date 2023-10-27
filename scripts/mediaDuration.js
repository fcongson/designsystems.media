const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const directoryPath = "../src/content/media"; // Replace with the actual path

// Initialize total duration
let totalDuration = 0;

// Read all files in the directory
const files = fs.readdirSync(directoryPath);

// Iterate through the files
for (const file of files) {
  const filePath = path.join(directoryPath, file);

  // Check if the file is a Markdown file
  if (path.extname(file) === ".md") {
    // Read the content of the Markdown file
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Parse the frontmatter and content using gray-matter
    const parsed = matter(fileContent);

    // Check if the "draft" frontmatter key is "false"
    if (parsed.data.draft === false) {
      // Extract the "duration" from frontmatter
      const duration = parsed.data.duration;

      // Check if the duration is in the format "00:00:00"
      if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) {
        // Split the duration string into hours, minutes, and seconds
        const [hours, minutes, seconds] = duration.split(":");

        // Convert the duration to seconds and add to the total duration
        totalDuration +=
          parseInt(hours, 10) * 3600 +
          parseInt(minutes, 10) * 60 +
          parseInt(seconds, 10);
      }
    }
  }
}

// Write the total duration to a JSON file
const outputFilePath = path.join(__dirname, "../data/total-duration.json");
fs.writeFileSync(outputFilePath, JSON.stringify({ totalDuration }));
