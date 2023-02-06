console.log("Siemka z konsoli");
const hoveredColor = document.getElementById("hovered-color");
const selectedColor = document.getElementById("selected-color");
const randomColor = document.getElementById("random-color");
const imgInp = document.getElementById("file-input");
const canvasWrapper = document.getElementById("canvas-wrapper");
const addColorButton = document.getElementById("add-color-button");
const addRandomColor = document.getElementById("add-random-color");

const MAX_WIDTH = window.innerWidth * 0.5;
const MAX_HEIGHT = window.innerHeight * 0.8;

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

    img.style.display = "none";

    canvas.addEventListener("mousemove", event => pick(event, hoveredColor, null, ctx));
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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
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

function getImageXY(width, height) {
  if (width > height) {
    if (width > MAX_WIDTH) {
      height = height * (MAX_WIDTH / width);
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width = width * (MAX_HEIGHT / height);
      height = MAX_HEIGHT;
    }
  }

  return [width, height];
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

function makeid(length = 10) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
