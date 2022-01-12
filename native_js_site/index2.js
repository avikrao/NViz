LEARNING_RATE = 0.08;
LAYER_COUNTS = [3, 5, 4, 1, 1];
(async () => {

    class TrainingPair {
        constructor(inputs, outputs) {
            this.inputs = inputs;
            this.outputs = outputs;
        }
    }

    class NeuralNetwork {

        constructor() {
            this.layers = [];
            this.gradients = [];
            this.changeBy = [];
            this.trainingPairList = [];
            this.nextTrainingPair = -1;
            this.completedIterations = 0;
            this.trainingSwitch = false;
        }

        setLearningRate(rate) {
            this.learningRate = rate;
        }

        dot(inputs, weights) {
            if (inputs.length != weights.length) {
                console.log("Dot issue");
                return 0.0;
            }

            let sum = 0.0;
            for (let i = 0; i < inputs.length; i++) {
                sum += inputs[i] * weights[i];
            }
            return sum;
        }

        hadamard(inputs, weights) {
            if (inputs.length != weights.length) {
                console.log("hadamard issue");
                return [];
            }

            let new_vec = [];
            for (let i = 0; i < inputs.length; i++) {
                new_vec.push(inputs[i] * weights[i]);
            }

            return new_vec;
        }
        
        createLayerStructure(random) {
            let main = [];
            for (let i = 0; i < this.layerCounts.length - 1; i++) {
                let inner = [];
                for (let j = 0; j < this.layerCounts[i+1]; j++) {
                    let innermost = [];
                    for (let k = 0; k < this.layerCounts[i]; k++) {
                        if (random) {
                            innermost.push(Math.random())
                        } else {
                            innermost.push(0.0);
                        }
                    }
                    inner.push(innermost);
                }
                main.push(inner);
            }
            return main;
        }

        setLayerCounts(counts) {
            this.layerCounts = counts;
            this.layers = this.createLayerStructure(true);
            this.gradients = this.createLayerStructure(false);
            this.changeBy = this.createLayerStructure(false);
        }
        
        transfer(x) {
            return 1.0/(1 + Math.exp(-x));
        }
        
        printWeights() {
            console.log(`Layer counts: ${this.layerCounts}`);
            for (let layer of this.layers) {
                for (let weights of layer) {
                    console.log(weights);
                }
            }
        }

        sigmoidDeriv(x) {
            return x*(1.0 - x);
        }

        backpropagate(inputs, target) {
            let z = [];
            let a = [];

            z.push(inputs);
            a.push(inputs);

            let inputList = JSON.parse(JSON.stringify(inputs));
            let outputList = [];

            let newInputs = [];
            let layerZ = [];
            let layerA = [];

            let product, nodeZ;
            for (let layer of this.layers) {
                newInputs = [];
                layerZ = [];
                layerA = [];
                for (let node of layer) {
                    nodeZ = this.dot(inputList, node);
                    layerZ.push(nodeZ);
                    product = this.transfer(nodeZ);
                    layerA.push(product);
                    newInputs.push(product);
                }
                z.push(layerZ);
                a.push(layerA);
                outputList = JSON.parse(JSON.stringify(inputList));
                inputList = JSON.parse(JSON.stringify(newInputs));
            }

            outputList = this.hadamard(outputList, this.layers.at(-1)[0]);
            a.pop();

            this.gradients.at(-1)[0][0] = target - outputList[0];
            this.changeBy.at(-1)[0][0] = this.gradients.at(-1)[0][0] * z.at(-1)[0];

            for (let layer = -2; layer > -this.layerCounts.length; layer--) {
                for (let out = 0; out < this.gradients.at(this.gradients.length + layer).length; out++) {
                    let gradOut = 0.0;
                    for (let end = 0; end < this.gradients.at(layer + 1 + this.gradients.length).length; end++) {
                        gradOut += this.gradients.at(layer+1 + this.gradients.length).at(end).at(out) * this.layers.at(layer+1 + this.layers.length).at(end).at(out) * this.sigmoidDeriv(a.at(layer+1 + a.length).at(out));
                    }

                    for (let node = 0; node < this.layerCounts.at(layer-1 + this.layerCounts.length); node++) {
                        this.gradients[layer + this.gradients.length][out][node] = gradOut;
                        this.changeBy[layer + this.changeBy.length][out][node] = gradOut * a.at(layer + a.length).at(node);
                    }
                }
            }

            for (let layer = 0; layer < this.layers.length; layer++) {
                for (let node = 0; node < this.layers.at(layer).length; node++) {
                    for (let weight = 0; weight < this.layers.at(layer).at(node).length; weight++) {
                        this.layers[layer][node][weight] += this.learningRate * this.changeBy.at(layer).at(node).at(weight);
                    }
                }
            }

            this.completedIterations++;
            return outputList
        }

        addTrainingPair(ins, outs) {
            this.trainingPairList.push(new TrainingPair(ins, outs));
        }

        train(count) {
            this.trainingSwitch = true;
            for(let i = 0; i < count; i++) {
                this.nextTrainingPair++;
                if (this.nextTrainingPair >= 5) {
                    this.nextTrainingPair = 0;
                }
                this.backpropagate(this.trainingPairList[this.nextTrainingPair].inputs, this.trainingPairList[this.nextTrainingPair].outputs[0]);
            }

            return this.completedIterations;
        }

    }

    let completedIterations = 0;

    const start = document.querySelector("#start");
    const stop = document.querySelector("#stop");

    const dataFetch = await fetch("./dataset.json");
    const jsonData = await dataFetch.json();
    const jsonPairs = jsonData["data"];

    const nn = new NeuralNetwork();
    nn.setLayerCounts(LAYER_COUNTS);
    nn.setLearningRate(LEARNING_RATE);

    for (let jsonPair of jsonPairs) {
        nn.addTrainingPair(jsonPair["in"], jsonPair["out"]);
    }

    start.addEventListener("click", async () => {
        console.log("Beginning training.");

        setTimeout(() => {
            console.log("Stopped training.");
            nn.trainingSwitch = false;
            nn.printWeights();
            console.log(`Completed iterations: ${completedIterations}`);
        }, 15000);
        do {
            completedIterations = nn.train(100000);
            await new Promise((resolve) => setTimeout(resolve));
        } while (nn.trainingSwitch);
    });

    stop.addEventListener("click", () => {
        console.log("Stopped training.");
        nn.trainingSwitch = false;
        nn.printWeights();
        console.log(`Completed iterations: ${completedIterations}`);
    });

})();