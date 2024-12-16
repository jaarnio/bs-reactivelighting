const RECTANGLE_SIZE = 30; // Size of the rectangles in pixels
const ANALYZE_SIZE = 30; // Number of pixels to analyze in the video frame

const videoContainer = document.getElementById("video-container");
const topSegmentsInput = document.getElementById("top-segments");
const rightSegmentsInput = document.getElementById("right-segments");
const bottomSegmentsInput = document.getElementById("bottom-segments");
const leftSegmentsInput = document.getElementById("left-segments");
const video = document.getElementById("video");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let rectanglesData = {};

topSegmentsInput.addEventListener("input", updateRectangles);
rightSegmentsInput.addEventListener("input", updateRectangles);
bottomSegmentsInput.addEventListener("input", updateRectangles);
leftSegmentsInput.addEventListener("input", updateRectangles);
video.addEventListener("play", analyzeFrame);
video.addEventListener("pause", analyzeFrame);
video.addEventListener("seeked", analyzeFrame);

function updateRectangles() {
  const topSegments = parseInt(topSegmentsInput.value);
  const rightSegments = parseInt(rightSegmentsInput.value);
  const bottomSegments = parseInt(bottomSegmentsInput.value);
  const leftSegments = parseInt(leftSegmentsInput.value);
  const videoWidth = videoContainer.clientWidth;
  const videoHeight = videoContainer.clientHeight;

  const topRectWidth = videoWidth / topSegments;
  const rightRectHeight = videoHeight / rightSegments;
  const bottomRectWidth = videoWidth / bottomSegments;
  const leftRectHeight = videoHeight / leftSegments;

  // Clear existing rectangles
  document.querySelectorAll(".rectangle").forEach((rect) => rect.remove());
  rectanglesData = {};

  let id = 1;

  // Top edge
  for (let i = 0; i < topSegments; i++) {
    const rect = document.createElement("div");
    rect.className = "rectangle";
    rect.id = id;
    rect.style.width = `${topRectWidth}px`;
    rect.style.height = `${RECTANGLE_SIZE}px`;
    rect.style.top = `-${RECTANGLE_SIZE}px`;
    rect.style.left = `${i * topRectWidth}px`;
    videoContainer.appendChild(rect);
    rectanglesData[id] = { id, avgColor: null, avgLuminance: null };
    id++;
  }

  // Right edge
  for (let i = 0; i < rightSegments; i++) {
    const rect = document.createElement("div");
    rect.className = "rectangle";
    rect.id = id;
    rect.style.width = `${RECTANGLE_SIZE}px`;
    rect.style.height = `${rightRectHeight}px`;
    rect.style.right = `-${RECTANGLE_SIZE}px`;
    rect.style.top = `${i * rightRectHeight}px`;
    videoContainer.appendChild(rect);
    rectanglesData[id] = { id, avgColor: null, avgLuminance: null };
    id++;
  }

  // Bottom edge
  for (let i = bottomSegments - 1; i >= 0; i--) {
    const rect = document.createElement("div");
    rect.className = "rectangle";
    rect.id = id;
    rect.style.width = `${bottomRectWidth}px`;
    rect.style.height = `${RECTANGLE_SIZE}px`;
    rect.style.bottom = `-${RECTANGLE_SIZE}px`;
    rect.style.left = `${i * bottomRectWidth}px`;
    videoContainer.appendChild(rect);
    rectanglesData[id] = { id, avgColor: null, avgLuminance: null };
    id++;
  }

  // Left edge
  for (let i = leftSegments - 1; i >= 0; i--) {
    const rect = document.createElement("div");
    rect.className = "rectangle";
    rect.id = id;
    rect.style.width = `${RECTANGLE_SIZE}px`;
    rect.style.height = `${leftRectHeight}px`;
    rect.style.left = `-${RECTANGLE_SIZE}px`;
    rect.style.top = `${i * leftRectHeight}px`;
    videoContainer.appendChild(rect);
    rectanglesData[id] = { id, avgColor: null, avgLuminance: null };
    id++;
  }

  //console.log(rectanglesData);
}

function analyzeFrame() {
  if (video.paused || video.ended) {
    return;
  }

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

  const topSegments = parseInt(topSegmentsInput.value);
  const rightSegments = parseInt(rightSegmentsInput.value);
  const bottomSegments = parseInt(bottomSegmentsInput.value);
  const leftSegments = parseInt(leftSegmentsInput.value);

  const topRectWidth = videoWidth / topSegments;
  const rightRectHeight = videoHeight / rightSegments;
  const bottomRectWidth = videoWidth / bottomSegments;
  const leftRectHeight = videoHeight / leftSegments;

  // Analyze top edge
  for (let i = 0; i < topSegments; i++) {
    const imageData = ctx.getImageData(i * topRectWidth, 0, topRectWidth, ANALYZE_SIZE);
    const { avgColor, avgLuminance } = calculateAverageColorAndLuminance(imageData);
    const rect = document.getElementById(i + 1);
    rect.style.backgroundColor = avgColor;
    rectanglesData[i + 1].avgColor = avgColor;
    rectanglesData[i + 1].avgLuminance = avgLuminance;
  }

  // Analyze right edge
  for (let i = 0; i < rightSegments; i++) {
    const imageData = ctx.getImageData(
      videoWidth - ANALYZE_SIZE,
      i * rightRectHeight,
      ANALYZE_SIZE,
      rightRectHeight
    );
    const { avgColor, avgLuminance } = calculateAverageColorAndLuminance(imageData);
    const rect = document.getElementById(topSegments + i + 1);
    rect.style.backgroundColor = avgColor;
    rectanglesData[topSegments + i + 1].avgColor = avgColor;
    rectanglesData[topSegments + i + 1].avgLuminance = avgLuminance;
  }

  // Analyze bottom edge
  for (let i = bottomSegments - 1; i >= 0; i--) {
    const imageData = ctx.getImageData(
      i * bottomRectWidth,
      videoHeight - ANALYZE_SIZE,
      bottomRectWidth,
      ANALYZE_SIZE
    );
    const { avgColor, avgLuminance } = calculateAverageColorAndLuminance(imageData);
    const rect = document.getElementById(
      topSegments + rightSegments + (bottomSegments - 1 - i) + 1
    );
    rect.style.backgroundColor = avgColor;
    rectanglesData[topSegments + rightSegments + (bottomSegments - 1 - i) + 1].avgColor =
      avgColor;
    rectanglesData[
      topSegments + rightSegments + (bottomSegments - 1 - i) + 1
    ].avgLuminance = avgLuminance;
  }

  // Analyze left edge
  for (let i = leftSegments - 1; i >= 0; i--) {
    const imageData = ctx.getImageData(
      0,
      i * leftRectHeight,
      ANALYZE_SIZE,
      leftRectHeight
    );
    const { avgColor, avgLuminance } = calculateAverageColorAndLuminance(imageData);
    const rect = document.getElementById(
      topSegments + rightSegments + bottomSegments + (leftSegments - 1 - i) + 1
    );
    rect.style.backgroundColor = avgColor;
    rectanglesData[
      topSegments + rightSegments + bottomSegments + (leftSegments - 1 - i) + 1
    ].avgColor = avgColor;
    rectanglesData[
      topSegments + rightSegments + bottomSegments + (leftSegments - 1 - i) + 1
    ].avgLuminance = avgLuminance;
  }

  //console.log(rectanglesData);
  requestAnimationFrame(analyzeFrame);
}

function calculateAverageColorAndLuminance(imageData) {
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  const pixelCount = data.length / 4;
  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  const avgColor = `rgb(${r}, ${g}, ${b})`;
  const avgLuminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return { avgColor, avgLuminance };
}

// Initial call to draw rectangles
updateRectangles();
// Start analyzing frames
requestAnimationFrame(analyzeFrame);
