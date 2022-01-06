const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [3, 5, 4, 1, 1];

var worker = new Worker("worker.js");

const button = document.querySelector("button");
let count = 1;
button.addEventListener("click", () => {
    console.log("clicked " + (count++).toString());
});