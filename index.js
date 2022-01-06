const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [3, 5, 4, 1, 1];

Module.onRuntimeInitialized = async () => {
    const dataFetch = await fetch("./dataset.json");
    const jsonData = await dataFetch.json();
    const jsonPairs = jsonData["data"];
    const NeuralNetwork = new Module.NeuralNetwork();
    for (let jsonPair of jsonPairs) {
        NeuralNetwork.addTrainingPair(jsonPair["in"], jsonPair["out"]);
    }
};
