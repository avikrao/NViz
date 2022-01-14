var worker = new Worker("newworker.js");

const start = document.querySelector("#start");
const stop = document.querySelector("#stop");

start.addEventListener("click", () => {
    worker.postMessage(1);
});

stop.addEventListener("click", () => {
    worker.postMessage(0);
});
