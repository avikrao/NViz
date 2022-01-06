self.importScripts("main.js");

const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [3, 5, 4, 1, 1];

Module.onRuntimeInitialized = async () => {
    const dataFetch = await fetch("./dataset.json");
    const jsonData = await dataFetch.json();
    const jsonPairs = jsonData["data"];
    let layerCounts = [jsonPairs[0]["in"].length];
        layerCounts = layerCounts.concat(LAYER_COUNTS);
        layerCounts.push(jsonPairs[0]["out"].length);
    console.log(layerCounts);
    const NeuralNetwork = new Module.NeuralNetwork();

    onmessage = () => {
        console.log("hi");
        NeuralNetwork.stopTest();
    }

    NeuralNetwork.setLayerCounts(LAYER_COUNTS);
    for (let jsonPair of jsonPairs) {
        NeuralNetwork.addTrainingPair(jsonPair["in"], jsonPair["out"]);
    }

    setTimeout(() => {
        NeuralNetwork.stopTest();
    }, 500)

    while (NeuralNetwork.getRunStatus()) {
        NeuralNetwork.startTest();
        await new Promise((resolve) => setTimeout(resolve));
    }


    // 1547, 5.16
};

