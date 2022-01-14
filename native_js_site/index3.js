LEARNING_RATE = 0.08;
LAYER_COUNTS = [3, 5, 4, 1, 1];
(async () => {

    class Neuron {
        constructor(numInputs) {
            this.delta = 0.0;
            this.output = 0.0;
            this.weights = [];
            for (let i = 0; i < numInputs + 1; i++) {
                this.weights.push(Math.random());
            }
        }

        dot(v1, v2) {
            if (v1.length != v2.length) {
                console.log(`Dot product error. ${v1.length} ${v2.length}`);
                return 0.0;
            }
            let total = 0.0;
            for (let i = 0; i < v1.length; i++) {
                total += v1[i] * v2[i];
            }

            return total;
        }

        transfer(x) {
            return Math.tanh(x);
        }

        fire(inputs) {
            this.output = this.transfer(this.dot(inputs, this.weights.slice(0, this.weights.length-1)));
            return this.output;
        }

        derivative() {
            return 1.0 - this.output*this.output;
        }
    }

    class Layer {
        constructor(numNeurons, numInputs) {
            this.neurons = [];
            for (let i = 0; i < numNeurons; i++) {
                this.neurons.push(new Neuron(numInputs));
            }
        }
    }

    class TrainingPair {
        constructor(inputs, outputs) {
            this.inputs = inputs;
            this.outputs = outputs;
        }
    }

    class NeuralNetwork {

        constructor() {
            this.learningRate = 0.01;
            this.layers = [];
            this.trainingPairList = [];
            this.nextTrainingPair = -1;
            this.trainingSwitch = false;
            this.iterations = 0;
        }

        setLearningRate(rate) {
            this.learningRate = rate;
        }

        setLayerCounts(layerCounts) {
            for (let i = 1; i < layerCounts.length; i++) {
                this.layers.push(new Layer(layerCounts[i], layerCounts[i-1]));
            }
        }

        trainingPairs() {
            return this.trainingPairList;
        }

        addTrainingPair(inputVal, outputVal) {
            this.trainingPairList.push(new TrainingPair(inputVal, outputVal));
        }

        getRunStatus() {
            return this.trainingSwitch;
        }

        feedForward(inputs) {
            let x = inputs;
            for (const layer of this.layers) {
                let newInputs = [];
                for (const neuron of layer.neurons) {
                    newInputs.push(neuron.fire(x));
                }
                x = newInputs;
            }
            return x;
        }

        backPropagate(expected) {
            for (let i = this.layers.length - 1; i >= 0; i--) {
                let layer = this.layers[i];
                let errors = [];
                if (i != this.layers.length - 1) {
                    for (let j = 0; j < layer.neurons.length; j++) {
                        let error = 0.0;
                        for (const neuron of this.layers[i+1].neurons) {
                            error += neuron.weights[j] * neuron.delta;
                        }
                        errors.push(error);
                    }
                } else {
                    for (let j = 0; j < layer.neurons.length; j++) {
                        let neuron = layer.neurons[j];
                        errors.push(expected[j] - neuron.output);
                    }
                }

                for (let j = 0; j < layer.neurons.length; j++) {
                    let neuron = layer.neurons[j];
                    neuron.delta = errors[j] * neuron.derivative();
                }
            }
        }

        updateWeights(inputs) {
            let realInputs = [];
            for (let i = 0; i < this.layers.length; i++) {
                if (i != 0) {
                    realInputs = [];
                    for (const neuron of this.layers[i-1].neurons) {
                        realInputs.push(neuron.output);
                    }
                } else {
                    realInputs = inputs;
                }

                for (const neuron of this.layers[i].neurons) {
                    for (let j = 0; j < realInputs.length; j++) {
                        neuron.weights[j] += this.learningRate * neuron.delta * realInputs[j];
                    }
                    neuron.weights[neuron.weights.length - 1] += this.learningRate * neuron.delta;
                }
            }
        }

        train(count) {
            this.trainingSwitch = true;
            for (let i = 0; i < count; i++) {
                if (++this.nextTrainingPair >= this.trainingPairList.length) {
                    this.nextTrainingPair = 0;
                }
                let inputs = this.trainingPairList[this.nextTrainingPair].inputs;
                let expected = this.trainingPairList[this.nextTrainingPair].outputs;
                let outputs = this.feedForward(inputs);
                let sumError = 0.0;
                for (let j = 0; j < expected.length; j++) {
                    sumError += Math.pow((expected[j] - outputs[j]), 2);
                }
                this.backPropagate(expected);
                this.updateWeights(inputs);
                this.iterations++;
            }

            return this.iterations;
        }

    }

    let completedIterations = 0;

    const start = document.querySelector("#start");
    const stop = document.querySelector("#stop");

    const dataFetch = await fetch("./dataset.json");
    const jsonData = await dataFetch.json();
    const jsonPairs = jsonData["data"];

    const nn = new NeuralNetwork();

    console.log(LAYER_COUNTS);

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
            // nn.printWeights();
            console.log(`Completed iterations: ${completedIterations}`);
        }, 15000);
        do {
            completedIterations = nn.train(500000);
            await new Promise((resolve) => setTimeout(resolve));
        } while (nn.trainingSwitch);
    });

    stop.addEventListener("click", () => {
        console.log("Stopped training.");
        nn.trainingSwitch = false;
        // nn.printWeights();
        console.log(nn.layers);
        console.log(`Completed iterations: ${completedIterations}`);
    });

})();