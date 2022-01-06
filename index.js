const LEARNING_RATE = 0.08;
const LAYER_COUNTS = [3, 5, 4, 1, 1];

Module.onRuntimeInitialized = async () => {
    const dataFetch = await fetch("./dataset.json");
    const jsonData = await dataFetch.json();
    const jsonPairs = jsonData["data"];
    const trainingList = new Module.TrainingPairList();
    for (let pair of jsonPairs) {
        trainingList.push_back(new Module.TrainingPair(pair["in"], pair["out"]));
    }
    
};
