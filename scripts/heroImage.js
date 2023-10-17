const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sourceDir = "../src/content/media"; // Path to the directory with subdirectories
const outputImage = "../public/heroImage.jpg"; // Path for the final output image

// Function to create a black background image
function createBlackBackground(outputWidth, outputHeight) {
  return sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 3, // Use 3 channels (RGB) for a black background
      background: { r: 0, g: 0, b: 0 }, // Solid black background
    },
  });
}

// Function to resize and save images
async function resizeAndSaveImages(
  selectedImages,
  imageWidth,
  imageHeight,
  tempDir
) {
  for (let index = 0; index < selectedImages.length; index++) {
    const image = selectedImages[index];

    if (!fs.existsSync(image)) {
      console.log(`Image does not exist: ${image}`);
      continue; // Skip this image and move to the next one
    }
    const fileName = `image_${index}.jpg`;
    console.log(`Copying ${image} to ${path.join(tempDir, fileName)}`);
    await sharp(image)
      .resize(imageWidth, imageHeight)
      .toFile(path.join(tempDir, fileName));
  }
}

// Function to composite images onto the background
function compositeImages(
  selectedImages,
  numRows,
  numCols,
  imageWidth,
  imageHeight,
  skew,
  horizontalShift,
  tempDir
) {
  const compositeImages = selectedImages.map((image, index) => ({
    input: path.join(tempDir, `image_${index}.jpg`),
    top: Math.floor(index / numCols) * imageHeight,
    left: (index % numCols) * imageWidth + (index % 2) * horizontalShift,
    skewX: index % 2 === 0 ? -skew : skew,
  }));

  return sharp({
    create: {
      width: imageWidth * numCols,
      height: imageHeight * numRows,
      channels: 3, // Use 3 channels (RGB) for the composite image
      background: { r: 0, g: 0, b: 0 }, // Solid black background
    },
  }).composite(compositeImages);
}

// Step 1: Read images from different folders
const folders = fs.readdirSync(sourceDir);
const selectedImages = [];

folders.forEach((folder) => {
  const folderPath = `${sourceDir}/${folder}`;

  // Check if it's a directory
  if (fs.statSync(folderPath).isDirectory()) {
    const files = fs.readdirSync(folderPath);

    // Filter out .DS_Store files and select only "maxresdefault.jpg"
    const imageFiles = files.filter(
      (file) => file !== ".DS_Store" && file === "maxresdefault.jpg"
    );

    if (imageFiles.length > 0) {
      // Assuming "hqdefault.jpg" exists in each subdirectory
      const selectedImage = path.join(folderPath, imageFiles[0]);
      selectedImages.push(selectedImage);
    }
  }
});

// Set the output dimensions
const numRows = 5;
const numCols = 6;
const outputWidth = 3200; // Half the width of the output image
const outputHeight = 1800; // Half the height of the output image
const skew = 0; // Adjust as needed
const horizontalShift = 0; // Adjust as needed

// Create a 'temp' directory for temporary files
const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Calculate the dimensions for each resized image
const imageWidth = Math.round(outputWidth / numCols);
const imageHeight = Math.round(outputHeight / numRows);

async function generateCompositeImage() {
  try {
    const background = createBlackBackground(outputWidth, outputHeight);
    console.log("Black background image created successfully.");

    await resizeAndSaveImages(selectedImages, imageWidth, imageHeight, tempDir);
    console.log("Selected images resized and saved to the temporary folder.");

    const composite = await compositeImages(
      selectedImages,
      numRows,
      numCols,
      imageWidth,
      imageHeight,
      skew,
      horizontalShift,
      tempDir
    );
    console.log("Composite image created successfully.");

    await composite.toFile(outputImage);
  } catch (err) {
    console.error(err);
  }
}

generateCompositeImage();
