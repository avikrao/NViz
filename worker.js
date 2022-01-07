self.importScripts("main.js");

const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [5, 4, 1];
let completedIterations = 0;

Module.onRuntimeInitialized = async () => {
    const dataFetch = await fetch("./dataset.json");
    const jsonData = await dataFetch.json();
    const jsonPairs = jsonData["data"];
    let layerCounts = [jsonPairs[0]["in"].length];
        layerCounts = layerCounts.concat(LAYER_COUNTS);
        layerCounts.push(jsonPairs[0]["out"].length);
    console.log(layerCounts);

    const NeuralNetwork = new Module.NeuralNetwork();

    NeuralNetwork.setLearningRate(LEARNING_RATE);
    NeuralNetwork.setLayerCounts(layerCounts);

    for (let jsonPair of jsonPairs) {
        NeuralNetwork.addTrainingPair(jsonPair["in"], jsonPair["out"]);
    }

    onmessage = async (message) => {
        switch (message.data) {
            case 0 :
                console.log("Stopped training.")
                NeuralNetwork.stopTraining();
                console.log(`Completed iterations: ${completedIterations}`);
                break;
            case 1 :
                console.log("Beginning training.");
                do {
                    completedIterations = NeuralNetwork.train(100000);
                    await new Promise((resolve) => setTimeout(resolve));
                } while (NeuralNetwork.getRunStatus());
                break;
        }
    }

    
};

