import { makeid, getRandomInt, getImageXY } from "./helpers";

const hoveredColor = document.getElementById("hovered-color");
const selectedColor = document.getElementById("selected-color");
const randomColor = document.getElementById("random-color");
const imgInp = document.getElementById("file-input");
const canvasWrapper = document.getElementById("canvas-wrapper");
const addColorButton = document.getElementById("add-color-button");
const addRandomColor = document.getElementById("add-random-color");

const DEFAULT_COLORS = 10;

let colors = [];

if (addColorButton) {
  addColorButton.addEventListener("click", e => {
    if (e.target.dataset.color) addColorToPallete(e.target.dataset.color);
  });
}

imgInp.onchange = evt => {
  const [file] = imgInp.files;
  if (file) {
    deleteAllPins();
    drawImage(file);

    document.querySelectorAll(".color-wrapper").forEach(cp => {
      cp.style.display = "flex";
    });
    addRandomColor.style.display = "inline-block";
  }
};

function drawImage(file) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = URL.createObjectURL(file);
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  img.addEventListener("load", function () {
    const [width, height] = getImageXY(this.width, this.height);
    canvas.width = width;
    canvas.height = height;
    canvasWrapper.style.width = width;
    canvasWrapper.style.height = height;
    // console.log("image size after resizing", width, height);
    ctx.drawImage(this, 0, 0, width, height);
    // console.log("image size", this.width, this.height);
    // console.log(getRandomInt(this.width), getRandomInt(this.height));

    const pixelatedZoomCtx = document.getElementById("pixelated-zoom").getContext("2d");
    pixelatedZoomCtx.imageSmoothingEnabled = false;
    pixelatedZoomCtx.mozImageSmoothingEnabled = false;
    pixelatedZoomCtx.webkitImageSmoothingEnabled = false;
    pixelatedZoomCtx.msImageSmoothingEnabled = false;

    const zoom = (ctx, x, y) => {
      ctx.drawImage(canvas, x - 2, y - 2, 5, 5, 0, 0, 100, 100);
    };

    img.style.display = "none";

    canvas.addEventListener("mousemove", event => {
      pick(event, hoveredColor, null, ctx);
      console.log(event);
      const magnifier = document.getElementById("magnifier-wrapper");
      magnifier.style.left = event.layerX + 1 + "px";
      magnifier.style.top = event.layerY + 1 + "px";
      magnifier.style.display = "block";
      const x = event.layerX;
      const y = event.layerY;
      zoom(pixelatedZoomCtx, x, y);
    });
    canvas.addEventListener("click", event => {
      const color = pick(event, selectedColor, null, ctx);
      addColorButton.dataset.color = color;
      addColorButton.style.display = "inline-block";
    });
    addRandomColor.addEventListener("click", () => {
      addPin(getRandomInt(width), getRandomInt(height), ctx);
      document.querySelectorAll(".color-preview").forEach(colorPreview => {
        colorPreview.removeEventListener("click", deleteColor);
      });
      document.querySelectorAll(".color-preview").forEach(colorPreview => {
        colorPreview.addEventListener("click", deleteColor);
      });
    });
    displayColors(width, height, ctx);
  });
}

function displayColors(width, height, ctx) {
  for (let i = 0; i < DEFAULT_COLORS; i++) {
    addPin(getRandomInt(width), getRandomInt(height), ctx);
  }

  document.querySelectorAll(".color-preview").forEach(colorPreview => {
    colorPreview.removeEventListener("click", deleteColor);
  });
  document.querySelectorAll(".color-preview").forEach(colorPreview => {
    colorPreview.addEventListener("click", deleteColor);
  });
}

function addColorToPallete(color) {
  if (colors[colors.length - 1] !== color) {
    const colorPreview = document.createElement("div");
    colorPreview.className = "color-preview random-color";
    const idx = makeid();
    colorPreview.id = idx;
    colorPreview.style.background = color;
    document.getElementById("random-color-wrapper").appendChild(colorPreview);
    colors.push({ id: idx, color });
    document.querySelectorAll(".color-preview").forEach(colorPreview => {
      colorPreview.removeEventListener("click", deleteColor);
    });
    document.querySelectorAll(".color-preview").forEach(colorPreview => {
      colorPreview.addEventListener("click", deleteColor);
    });
  }
}

function addPin(x, y, ctx) {
  const pin = document.createElement("div");

  const colorPreview = document.createElement("div");
  colorPreview.className = "color-preview random-color";
  const idx = makeid();
  colorPreview.id = idx;
  document.getElementById("random-color-wrapper").appendChild(colorPreview);

  pin.className = "color-pin";
  pin.style.left = x - 9 + "px";
  pin.style.top = y - 9 + "px";
  pin.id = "pin_" + idx;
  const rgba = pick(null, colorPreview, { x, y }, ctx);
  colors.push({ id: idx, color: rgba });
  // console.log("colors add pin", colors);
  colorPreview.background = rgba;
  pin.style.background = rgba;
  // console.log("pin coords", x, y);
  document.getElementById("canvas-wrapper").appendChild(pin);
  // console.log("random c", x, y);
}

function deleteAllPins() {
  document.querySelectorAll(".random-color").forEach(preview => {
    preview.remove();
  });
  document.querySelectorAll(".color-pin").forEach(pin => {
    pin.remove();
  });
}

function deleteColor(e) {
  const id = e.target.id;
  document.getElementById(id).remove();
  document.getElementById("pin_" + id)?.remove();
  colors = colors.filter(color => color.id !== id);
}

function pick(event, destination, random, ctx) {
  const bounding = canvas.getBoundingClientRect();
  let x;
  // event.clientX - bounding.left;
  let y;
  // event.clientY - bounding.top;

  if (random) {
    x = random.x;
    y = random.y;
  } else {
    x = event.clientX - bounding.left;
    y = event.clientY - bounding.top;
  }

  const pixel = ctx.getImageData(x, y, 1, 1);
  const data = pixel.data;

  const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
  destination.style.background = rgba;

  if (document.getElementById(`${destination.id}-value`))
    document.getElementById(`${destination.id}-value`).textContent = rgba;

  return rgba;
}
