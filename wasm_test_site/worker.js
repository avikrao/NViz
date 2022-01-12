self.importScripts("main.js");

const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [5, 4, 1];


Module.onRuntimeInitialized = async () => {

    let completedIterations = 0;
    let weights;

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

    function getWeights() {

        const newWeights = [];

        for (let layer = 0; layer < layerCounts.length-1; layer++) {
            let layerVector = NeuralNetwork.getLayer(layer);
            newWeights.push([]);
            for (let node = 0; node < layerVector.size(); node++) {
                let nodeVector = layerVector.get(node);
                newWeights[newWeights.length-1].push([]);
                for (let weight = 0; weight < nodeVector.size(); weight++) {
                    newWeights[newWeights.length - 1][newWeights[newWeights.length - 1].length - 1].push(nodeVector.get(weight));
                }
            }
        }

        return newWeights;
    }

    onmessage = async (message) => {
        switch (message.data) {
            case 0 :
                console.log("Stopped training.")
                NeuralNetwork.stopTraining();
                console.log(`Completed iterations: ${completedIterations}`);
                console.log(getWeights());
                break;
            case 1 :
                console.log("Beginning training.");
                setTimeout(() => {
                    console.log("Stopped training.")
                    NeuralNetwork.stopTraining();
                    console.log(`Completed iterations: ${completedIterations}`);
                    console.log(getWeights());
                }, 15000);
                do {
                    completedIterations = NeuralNetwork.train(100000);
                    getWeights();
                    await new Promise((resolve) => setTimeout(resolve));
                } while (NeuralNetwork.getRunStatus());
                break;
        }
    }
};

