self.importScripts("main.js");
self.importScripts("workercodes.js");

Module.onRuntimeInitialized = async () => {

    postMessage({code: ReturnCode.ModuleReady})

    const nn = new Module.NeuralNetwork();

    let uploadedValidDataset = false;
    let layerCounts = [];
    let trainingSpeed = 1;
    let inputSize = 0; 
    let outputSize = 0;
    let completedIterations = 0;
    let weights = [];

    function getWeights() {

        const newWeights = [];

        for (let layer = 0; layer < layerCounts.length-1; layer++) {
            let layerVector = nn.getLayer(layer);
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
        const payload = message.data;

        switch (message.data.code) {
            case MessageCode.StopTraining :
                // PLACEHOLDER FOR STOP TRAINING CODE
                nn.stopTraining();
                console.log(completedIterations);
                postMessage({code: ReturnCode.StoppedTraining});
                break;
            case MessageCode.StartTraining :

                if (!(inputSize && outputSize)) {
                    postMessage({code: ReturnCode.MissingJSON});
                } else if (!layerCounts.length) {
                    postMessage({code: ReturnCode.InvalidLayers});
                } else if (layerCounts[0] != inputSize) {
                    postMessage({code: InvalidInputs});
                } else if (layerCounts[layerCounts.length-1] != outputSize) {
                    postMessage({code: ReturnCode.InvalidOutputs});
                } else {
                    // PLACEHOLDER FOR START TRAINING CODE
                    postMessage({code: ReturnCode.StartSuccess});
                    do {
                        completedIterations = nn.train(trainingSpeed);
                        weights = getWeights();
                        postMessage({code: ReturnCode.TrainingUpdate, weights: weights, layers: layerCounts});
                        await new Promise(resolve => setTimeout(resolve));
                    } while (nn.getRunStatus());
                }
                return;

            case MessageCode.FileUpload :
                
                const jsonPairs = message.data?.file?.data;
                if (!jsonPairs || jsonPairs.length < 1) {
                    
                    postMessage({code: ReturnCode.JSONFormatError});
                    return;
                }

                const inputLength = jsonPairs[0]["in"].length;
                const outputLength = jsonPairs[0]["out"].length;

                for (const jsonPair of jsonPairs) {
                    const pairIn = jsonPair["in"];
                    const pairOut = jsonPair["out"];
                    if (!(pairIn && pairOut) 
                        || pairIn.length != inputLength 
                        || pairOut.length != outputLength) {
                        postMessage({code: ReturnCode.JSONPairSizeError});
                        return;
                    }

                    for (const val of pairIn) {
                        if (!Number.isFinite(val)) {
                            postMessage({code: ReturnCode.JSONPairEntryError});
                            return;
                        }
                    }
                }

                for (const jsonPair of jsonPairs) {
                    nn.addTrainingPair([...jsonPair["in"], 1.0], jsonPair["out"]);
                }

                inputSize = inputLength + 1;
                outputSize = outputLength;

                postMessage({code: ReturnCode.JSONSuccess});
                return;
            
            case MessageCode.LayersSet :
                if (payload.layers) {
                    layerCounts = [payload.layers[0] + 1, ...payload.layers.slice(1)];
                }
                nn.setLayerCounts(layerCounts);
                return;
            
            case MessageCode.ValuesUpdate :
                trainingSpeed = payload.trainingSpeed ? payload.trainingSpeed : trainingSpeed;
                if (payload.learningRate) {
                    nn.setLearningRate(payload.learningRate);
                }
                return;       
        }
    }
}
