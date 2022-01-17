#include <iostream>
#include <vector>
#include <cmath>
#include <random>
#include <emscripten.h>
#include <emscripten/bind.h>

class NeuralNetwork {
private: 

    class Layer {
    public:

        struct Neuron {

            double delta;
            double output;
            std::vector<double> weights;
            Neuron(int num_inputs) {
                delta = 0.0;
                output = 0.0;
                for (int i = 0; i < num_inputs; i++) {
                    weights.push_back((double)rand() / RAND_MAX);
                }
            }

            double dot(const std::vector<double> &v1, const std::vector<double> &v2) {
                if (v1.size() != v2.size()) {
                    std::cout << "Dot product error. " << std::endl;
                    return 0.0;
                }

                double total = 0.0;
                for (size_t i = 0; i < v1.size(); i++) {
                    total += v1[i] * v2[i];
                }

                return total;
            }

            double transfer(double x) {
                // return std::tanh(x);
                return 1.0/(1 + std::exp(-x));
            }

            double fire(std::vector<double> &inputs) {
                output = transfer(dot(inputs, weights));
                return output;
            }

            double derivative() {
                // return 1.0 - output*output;
                return output*(1.0 - output);
            }
        };

        std::vector<Neuron> neurons;

        Layer(int num_neurons, int num_inputs) {
            for(int i = 0; i < num_neurons; i++) {
                neurons.push_back(Neuron(num_inputs));
            }
        }

    };

    class TrainingPair {

        public: 
            TrainingPair(const emscripten::val &input_val, const emscripten::val &output_val) {
                _input_vector = emscripten::convertJSArrayToNumberVector<double>(input_val);
                _output_vector = emscripten::convertJSArrayToNumberVector<double>(output_val);
            }

            std::vector<double> inputs() {
                return _input_vector;
            }

            double input_entry(size_t index) {
                return _input_vector.at(index);
            }

            std::vector<double> outputs() {
                return _output_vector;
            }

            double output_entry(size_t index) {
                return _output_vector.at(index);
            }

        private:
            std::vector<double> _input_vector;
            std::vector<double> _output_vector;
    };

public: 

    double learning_rate;
    std::vector<Layer> layers;
    std::vector<TrainingPair> training_pair_list;
    bool training_switch = false;
    int next_training_pair = -1;
    unsigned long long epochs = 0;

    NeuralNetwork() = default;

    void set_learning_rate(double rate) {
        learning_rate = rate;
    }

    void set_layer_counts(const emscripten::val &js_layers) {

        layers.clear();
        epochs = 0;
        next_training_pair = -1;
        std::vector<int> layer_counts = emscripten::convertJSArrayToNumberVector<int>(js_layers);
        for (int i = 1; i < layer_counts.size(); i++) {
            layers.push_back(Layer(layer_counts[i], layer_counts[i-1]));
        }
    }

    std::vector<TrainingPair> training_pairs() {
        return training_pair_list;
    }

    void reset_training_pairs() {
        training_pair_list.clear();
    }

    void add_training_pair(const emscripten::val input_val, const emscripten::val output_val) {
        training_pair_list.push_back(TrainingPair(input_val, output_val));
    }

    bool get_run_status() {
        return training_switch;
    }

    std::vector<double> feed_forward(const std::vector<double> &inputs) {
        std::vector<double> x = inputs;
        for (Layer &layer : layers) {
            std::vector<double> new_inputs;
            for (Layer::Neuron &neuron : layer.neurons) {
                new_inputs.push_back(neuron.fire(x));
            }
            x = new_inputs;
        }
        return x;
    }

    std::vector<double> predict(const emscripten::val &js_inp) {
        std::vector<double> inp = emscripten::convertJSArrayToNumberVector<double>(js_inp);
        std::vector<double> result = feed_forward(inp);
        for (double d : result) {
            std::cout << d << " ";
        }
        std::cout << std::endl;
        return result;
    }

    void back_propagate(const std::vector<double> &expected){ 
        for (int i = layers.size() - 1; i >= 0; i--) {
            Layer &layer = layers[i];
            std::vector<double> errors;
            if (i != layers.size() - 1) {
                for (size_t j = 0; j < layer.neurons.size(); j++) {
                    double error = 0.0;
                    for (const Layer::Neuron &neuron : layers[i+1].neurons) {
                        error += neuron.weights[j] * neuron.delta;
                    }
                    errors.push_back(error);
                }
            } else {
                for (size_t j = 0; j < layer.neurons.size(); j++) {
                    Layer::Neuron &neuron = layer.neurons[j];
                    errors.push_back(expected[j] - neuron.output);
                }
            }

            for (size_t j = 0; j < layer.neurons.size(); j++) {
                Layer::Neuron &neuron = layer.neurons[j];
                neuron.delta = errors[j] * neuron.derivative();
            }
        }
    }

    void update_weights(const std::vector<double> &inputs) {
        std::vector<double> real_inputs;
        for (size_t i = 0; i < layers.size(); i++) {
            if (i != 0) {
                real_inputs.clear();
                for (Layer::Neuron &neuron : layers[i-1].neurons) {
                    real_inputs.push_back(neuron.output);
                }
            } else {
                real_inputs = inputs;
            }

            for (Layer::Neuron &neuron : layers[i].neurons) {
                for (size_t j = 0; j < real_inputs.size(); j++) {
                    neuron.weights[j] += learning_rate * neuron.delta * real_inputs[j];
                }
            }
        }
    }

    double train(int count) {
        training_switch = true;
        double sum_error = 0.0;
        for (int i = 0; i < count; i++) {
            if (++next_training_pair >= training_pair_list.size()) {
                next_training_pair = 0;
                epochs++;
            }
            const std::vector<double> &inputs = training_pair_list[next_training_pair].inputs();
            const std::vector<double> &expected = training_pair_list[next_training_pair].outputs();
            std::vector<double> outputs = feed_forward(inputs);
            sum_error = 0.0;
            for (int j = 0; j < expected.size(); j++) {
                sum_error += std::pow((expected[j] - outputs[j]), 2);
            }
            back_propagate(expected);
            update_weights(inputs);
        }
        return sum_error;
    }

    void stop_training() {
        training_switch = false;
        std::cout << "Completed epochs: " << epochs << std::endl;
    }

    std::vector<std::vector<double>> get_layer(int index) {
        std::vector<std::vector<double>> layer;
        for (const Layer::Neuron &neuron : layers[index].neurons) {
            layer.push_back(neuron.weights);
        }

        return layer;
    }

    int get_epochs() {
        return epochs;
    }

    std::vector<double> run_prediction(const emscripten::val &js_input) {
        std::vector<double> input = emscripten::convertJSArrayToNumberVector<double>(js_input);
        return feed_forward(input);
    }
};

EMSCRIPTEN_BINDINGS(neural_visual) {
    emscripten::class_<NeuralNetwork>("NeuralNetwork")
        .constructor()
        .function("setLearningRate", &NeuralNetwork::set_learning_rate)
        .function("setLayerCounts", &NeuralNetwork::set_layer_counts)
        .function("addTrainingPair", &NeuralNetwork::add_training_pair)
        .function("train", &NeuralNetwork::train)
        .function("stopTraining", &NeuralNetwork::stop_training)
        .function("getRunStatus", &NeuralNetwork::get_run_status)
        .function("getLayer", &NeuralNetwork::get_layer)
        .function("predict", &NeuralNetwork::predict)
        .function("getEpochs", &NeuralNetwork::get_epochs)
        .function("resetTrainingPairs", &NeuralNetwork::reset_training_pairs)
        .function("runPrediction", &NeuralNetwork::run_prediction);
    emscripten::register_vector<std::vector<double>>("std::vector<std::vector<double>>");
    emscripten::register_vector<double>("std::vector<double>");
}