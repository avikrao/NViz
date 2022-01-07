const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [5, 4, 1];

var worker = new Worker("worker.js");

const start = document.querySelector("#start");
const stop = document.querySelector("#stop");

start.addEventListener("click", () => {
    worker.postMessage(1);
});

stop.addEventListener("click", () => {
    worker.postMessage(0);
});
