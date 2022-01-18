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

        std::vector<double> outputs() {
            return _output_vector;
        }

    private:
        std::vector<double> _input_vector;
        std::vector<double> _output_vector;
    };

    double _learning_rate;
    std::vector<Layer> _layers;
    std::vector<TrainingPair> _training_pair_list;
    bool _training_switch;
    long _next_training_pair = -1;
    unsigned long long _epochs = 0;

    std::vector<double> _feed_forward(const std::vector<double> &inputs) {
        std::vector<double> x = inputs;
        for (Layer &layer : _layers) {
            std::vector<double> new_inputs;
            for (Layer::Neuron &neuron : layer.neurons) {
                new_inputs.push_back(neuron.fire(x));
            }
            x = new_inputs;
        }
        return x;
    }

    void _back_propagate(const std::vector<double> &expected){ 
        for (int i = _layers.size() - 1; i >= 0; i--) {
            Layer &layer = _layers[i];
            std::vector<double> errors;
            if (i != _layers.size() - 1) {
                for (size_t j = 0; j < layer.neurons.size(); j++) {
                    double error = 0.0;
                    for (const Layer::Neuron &neuron : _layers[i+1].neurons) {
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

    void _update_weights(const std::vector<double> &inputs) {
        std::vector<double> real_inputs;
        for (size_t i = 0; i < _layers.size(); i++) {
            if (i != 0) {
                real_inputs.clear();
                for (Layer::Neuron &neuron : _layers[i-1].neurons) {
                    real_inputs.push_back(neuron.output);
                }
            } else {
                real_inputs = inputs;
            }

            for (Layer::Neuron &neuron : _layers[i].neurons) {
                for (size_t j = 0; j < real_inputs.size(); j++) {
                    neuron.weights[j] += _learning_rate * neuron.delta * real_inputs[j];
                }
            }
        }
    }

public: 

    NeuralNetwork() = default;

    void set_learning_rate(double rate) {
        _learning_rate = rate;
    }

    void set_layer_counts(const emscripten::val &js__layers) {

        _layers.clear();
        _epochs = 0;
        _next_training_pair = -1;
        std::vector<int> layer_counts = emscripten::convertJSArrayToNumberVector<int>(js__layers);
        for (int i = 1; i < layer_counts.size(); i++) {
            _layers.push_back(Layer(layer_counts[i], layer_counts[i-1]));
        }

    }

    void reset_training_pairs() {
        _training_pair_list.clear();
    }

    void add_training_pair(const emscripten::val input_val, const emscripten::val output_val) {
        _training_pair_list.push_back(TrainingPair(input_val, output_val));
    }

    bool get_run_status() {
        return _training_switch;
    }

    std::vector<double> predict(const emscripten::val &js_inp) {
        std::vector<double> inp = emscripten::convertJSArrayToNumberVector<double>(js_inp);
        std::vector<double> result = _feed_forward(inp);
        return result;
    }

    double train(int count) {
        _training_switch = true;
        double sum_error = 0.0;
        double mean_squared_error = 0.0;
        for (int i = 0; i < count; i++) {
            if (++_next_training_pair >= _training_pair_list.size()) {
                mean_squared_error = sum_error/_training_pair_list.size();
                sum_error = 0.0;
                _next_training_pair = 0;
                _epochs++;
            }
            const std::vector<double> &inputs = _training_pair_list[_next_training_pair].inputs();
            const std::vector<double> &expected = _training_pair_list[_next_training_pair].outputs();
            std::vector<double> outputs = _feed_forward(inputs);
            for (int j = 0; j < expected.size(); j++) {
                sum_error += std::pow((expected[j] - outputs[j]), 2);
            }
            _back_propagate(expected);
            _update_weights(inputs);
        }
        return mean_squared_error;
    }

    void stop_training() {
        _training_switch = false;
    }

    std::vector<std::vector<double>> get_layer(int index) {
        std::vector<std::vector<double>> layer;
        for (const Layer::Neuron &neuron : _layers[index].neurons) {
            layer.push_back(neuron.weights);
        }

        return layer;
    }

    int get_epochs() {
        return _epochs;
    }

    std::vector<double> run_prediction(const emscripten::val &js_input) {
        std::vector<double> input = emscripten::convertJSArrayToNumberVector<double>(js_input);
        return _feed_forward(input);
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