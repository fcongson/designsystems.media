const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const sourceDir = "../src/content/media"; // Path to the directory with subdirectories
const outputImage = "../public/heroImage.jpg"; // Path for the final output image
const numImagesToSelect = 30; // Number of images to select and process

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

// Function to resize and save images while maintaining the aspect ratio
async function resizeAndSaveImages(selectedImages, imageWidth, tempDir) {
  for (let index = 0; index < selectedImages.length; index++) {
    const image = selectedImages[index];

    if (!fs.existsSync(image)) {
      console.log(`Image does not exist: ${image}`);
      continue; // Skip this image and move to the next one
    }

    const imageInfo = await sharp(image).metadata();
    const aspectRatio = imageInfo.width / imageInfo.height;

    const newHeight = Math.round(imageWidth / aspectRatio);

    const fileName = `image_${index}.jpg`;
    console.log(`Copying and resizing ${image}`);

    await sharp(image)
      .resize(imageWidth, newHeight) // Resize while maintaining aspect ratio
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

// Step 1: Read all potential image files from different folders
const folders = fs.readdirSync(sourceDir);
const potentialImages = [];

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
      // Assuming "maxresdefault.jpg" exists in each subdirectory
      const potentialImage = path.join(folderPath, imageFiles[0]);
      potentialImages.push(potentialImage);
    }
  }
});

// Shuffle the potential images randomly
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffleArray(potentialImages);

// Select the first 30 images from the shuffled array
const selectedImages = potentialImages.slice(0, numImagesToSelect);

// Set the output dimensions
const numRows = 6;
const numCols = 5;
const outputWidth = 3200; // Half the width of the output image
const outputHeight = 2160; // Half the height of the output image
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

    await resizeAndSaveImages(selectedImages, imageWidth, tempDir);
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
