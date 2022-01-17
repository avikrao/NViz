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
    let epochs = 0;
    let error = 0.0;
    let weights = [];

    let predictionInputs = [];

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
                weights = getWeights();
                postMessage({code: ReturnCode.StoppedTraining, weights: weights, epochs: epochs, error: error});
                break;
            case MessageCode.StartTraining :

                if (!(inputSize && outputSize)) {
                    postMessage({code: ReturnCode.MissingJSON});
                } else if (!layerCounts.length) {
                    postMessage({code: ReturnCode.InvalidLayers});
                } else if (layerCounts[0] != inputSize) {
                    postMessage({code: ReturnCode.InvalidInputs});
                } else if (layerCounts[layerCounts.length-1] != outputSize) {
                    postMessage({code: ReturnCode.InvalidOutputs});
                } else {
                    // PLACEHOLDER FOR START TRAINING CODE
                    postMessage({code: ReturnCode.StartSuccess});
                    do {
                        error = nn.train(trainingSpeed);
                        epochs = nn.getEpochs();
                        weights = getWeights();
                        postMessage({code: ReturnCode.TrainingUpdate, weights: weights, epochs: epochs, error: error});
                        await new Promise(resolve => setTimeout(resolve));
                    } while (nn.getRunStatus());
                }
                return;

            case MessageCode.TrainingUpload :
                
                nn.resetTrainingPairs();
                const jsonPairs = message.data?.file?.data;
                if (!jsonPairs || jsonPairs.length < 1) {
                    
                    postMessage({code: ReturnCode.JSONFormatError});
                    return;
                }

                const inputLength = jsonPairs[0]["input"]?.length;
                const outputLength = jsonPairs[0]["output"]?.length;

                if (!(inputLength && outputLength)) {
                    postMessage({code: ReturnCode.JSONFormatError});
                    return;
                }

                for (const [pairIndex, jsonPair] of jsonPairs.entries()) {
                    const pairIn = jsonPair["input"];
                    const pairOut = jsonPair["output"];
                    if (!(pairIn && pairOut) 
                        || pairIn.length != inputLength 
                        || pairOut.length != outputLength) {
                        postMessage({code: ReturnCode.JSONPairSizeError, index: pairIndex});
                        return;
                    }

                    for (const [valIndex, val] of pairIn.entries()) {
                        if (!Number.isFinite(val)) {
                            postMessage({code: ReturnCode.JSONPairEntryError, pairIndex: pairIndex, valIndex: valIndex});
                            return;
                        }
                    }
                }

                for (const jsonPair of jsonPairs) {
                    nn.addTrainingPair([...jsonPair["input"], 1.0], jsonPair["output"]);
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
            case MessageCode.InputUpload :

                predictionInputs = [];

                const uploadedInputs = message?.data?.file?.inputs;
                if (!uploadedInputs) {
                    postMessage({code: ReturnCode.InvalidInputJSONFormat})
                }

                for (const inputList of uploadedInputs) {
                    if (inputList.length !== layerCounts[0] - 1) {
                        postMessage({code: ReturnCode.InputFileEntrySizeError});
                        return;
                    }

                    for (const val of inputList) {
                        if (!Number.isFinite(val)) {
                            postMessage({code: ReturnCode.InputFileNumberError});
                            return;
                        }
                    }

                    predictionInputs.push([...inputList, 1.0]);
                }

                postMessage({code: ReturnCode.InputUploadSuccess})
                return;
            case MessageCode.RunPrediction :

                const predictionOutputs = {"outputs": []};
                for (const inputList of predictionInputs) {
                    let outputList = [];
                    let predictedOutput = nn.runPrediction(inputList);
                    for (let i = 0; i < predictedOutput.size(); i++) {
                        outputList.push(predictedOutput.get(i));
                    }
                    predictionOutputs["outputs"].push(outputList);
                }

                postMessage({code: ReturnCode.PredictionSuccess, outputs: predictionOutputs});
                return;
        }
    }
}
