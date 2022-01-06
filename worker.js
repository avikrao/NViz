self.importScripts("main.js");

const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [3, 5, 4, 1, 1];
let found = false;

Module.onRuntimeInitialized = async () => {
    const dataFetch = await fetch("./dataset.json");
    const jsonData = await dataFetch.json();
    const jsonPairs = jsonData["data"];
    let layerCounts = [jsonPairs[0]["in"].length];
        layerCounts = layerCounts.concat(LAYER_COUNTS);
        layerCounts.push(jsonPairs[0]["out"].length);
    console.log(layerCounts);
    const NeuralNetwork = new Module.NeuralNetwork();

    onmessage = async (message) => {
        switch (message.data) {
            case 0 :
                console.log("Stopped training.")
                NeuralNetwork.stopTraining();
                break;
            case 1 :
                console.log("Beginning training.");
                do {
                    NeuralNetwork.train(100);
                    await new Promise((resolve) => setTimeout(resolve));
                } while (NeuralNetwork.getRunStatus());
                break;
        }
    }

    NeuralNetwork.setLayerCounts(LAYER_COUNTS);
    for (let jsonPair of jsonPairs) {
        NeuralNetwork.addTrainingPair(jsonPair["in"], jsonPair["out"]);
    }

    while (NeuralNetwork.getRunStatus()) {
        NeuralNetwork.train(100);
        await new Promise((resolve) => setTimeout(resolve));
    } 

};

