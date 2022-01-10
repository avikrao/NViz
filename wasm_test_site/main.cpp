#include <iostream>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <unistd.h>
#include <cmath>

#define console std::cout << "[C++] "

class NeuralNetwork {

    private:
        float _learning_rate;
        std::vector<int> _layer_counts;
        std::vector<std::vector<std::vector<float>>> _layers;
        std::vector<std::vector<std::vector<float>>> _gradients;
        std::vector<std::vector<std::vector<float>>> _change_by;
        bool _training_switch = false;
        size_t _next_training_pair = -1;
        unsigned long long _completed_iterations = 0;

        class TrainingPair {

            public: 
                TrainingPair(emscripten::val &input_val, emscripten::val &output_val) {
                    _input_vector = emscripten::convertJSArrayToNumberVector<float>(input_val);
                    _output_vector = emscripten::convertJSArrayToNumberVector<float>(output_val);
                }

                std::vector<float> inputs() {
                    return _input_vector;
                }

                float input_entry(size_t index) {
                    return _input_vector.at(index);
                }

                std::vector<float> outputs() {
                    return _output_vector;
                }

                float output_entry(size_t index) {
                    return _output_vector.at(index);
                }

            private:
                std::vector<float> _input_vector;
                std::vector<float> _output_vector;
        };

        std::vector<TrainingPair> _training_pair_list;

        float _dot(std::vector<float> &inputs, std::vector<float> &weights) {

            if (inputs.size() != weights.size()) {
                console << "Dot product issue." << std::endl;
                console << "Inputs size: " << inputs.size() << " Weights size: " << weights.size() << std::endl;
                return 0.0;
            }

            float sum = 0.0;
            for (size_t i = 0; i < inputs.size(); i++) {
                sum += inputs.at(i) * weights.at(i);
            }

            return sum;
        }

        std::vector<float> _hadamard(std::vector<float> &inputs, std::vector<float> &weights) {

            if (inputs.size() != weights.size()) {
                console << "Hadamard product issue." << std::endl;
                console << "Inputs size: " << inputs.size() << " Weights size: " << weights.size() << std::endl;
                return std::vector<float>();
            }

            std::vector<float> new_vector;
            for (size_t i = 0; i < inputs.size(); i++) {
                new_vector.push_back(inputs.at(i) * weights.at(i));
            }

            return new_vector;
        }

        std::vector<std::vector<std::vector<float>>> _create_layer_structure(bool random) {

            std::vector<std::vector<std::vector<float>>> main_vector;
            for (size_t i = 0; i < _layer_counts.size() - 1; i++) {

                std::vector<std::vector<float>> inner_vector;
                for (size_t j = 0; j < _layer_counts.at(i+1); j++) {
                    std::vector<float> innermost_vector;
                    for (size_t k = 0; k < _layer_counts.at(i); k++) {
                        if (random) {
                            innermost_vector.push_back((double)std::rand() / RAND_MAX);
                        } else {
                            innermost_vector.push_back(0.0);
                        }
                    }
                    inner_vector.push_back(innermost_vector);
                }
                main_vector.push_back(inner_vector);
            }
            return main_vector;
        }

        float _transfer(float x) {
            return 1.0/(1 + std::exp(-x));
        }

        void _print_weights() { 
            console << "Layer counts: ";
            for (int i : _layer_counts) {
                std::cout << i << " ";
            }
            std::cout << std::endl;
            // std::cout << std::fixed;
            std::cout.precision(4);
            for (std::vector<std::vector<float>> &layer : _layers) {
                for (std::vector<float> &weights : layer) {
                    for (float weight : weights) {
                        std::cout << weight << " ";
                    }
                }
                std::cout << std::endl;
            }
        }

        std::vector<float> _feed_forward(std::vector<float> &inputs) {
            std::vector<float> input_list = inputs;
            std::vector<float> output_list;
            std::vector<float> new_inputs;
            float node_z, product;
            for (std::vector<std::vector<float>> &layer : _layers) {
                new_inputs.clear();
                for (std::vector<float> &node : layer) {
                    node_z = _dot(input_list, node);
                    product = _transfer(node_z);
                    new_inputs.push_back(product);
                }
                output_list = input_list;
                input_list = new_inputs;
            }

            output_list = _hadamard(output_list, _layers.back().front());
            return output_list;
        }

        float _sigmoid_deriv(float x) {
            return x*(1.0 - x);
        }

        std::vector<float> _backpropagate(const std::vector<float> &inputs, float target) {

            std::vector<std::vector<float>> z;
            std::vector<std::vector<float>> a;

            z.push_back(inputs);
            a.push_back(inputs);

            std::vector<float> inputList = inputs;
            std::vector<float> outputList;
            std::vector<float> new_inputs;
            std::vector<float> layer_z;
            std::vector<float> layer_a;

            float product, node_z;
            for (std::vector<std::vector<float>> &layer : _layers) {
                new_inputs.clear();
                layer_z.clear();
                layer_a.clear();
                for (std::vector<float> &node : layer) {
                    node_z = _dot(inputList, node);
                    layer_z.push_back(node_z);
                    product = _transfer(node_z);
                    layer_a.push_back(product);
                    new_inputs.push_back(product);
                }
                z.push_back(layer_z);
                a.push_back(layer_a);
                outputList = inputList;
                inputList = new_inputs;
            }

            outputList = _hadamard(outputList, _layers.back().front());
            a.pop_back();

            _gradients.back().front().front() = target - outputList.front();
            _change_by.back().front().front() = _gradients.back().front().front() * z.back().front();

            for (int layer = -2; layer > -_layer_counts.size(); layer--) {
                for (int out = 0; out < _gradients.at(_gradients.size() + layer).size(); out++) {
                    float grad_out = 0.0;
                    for (int end = 0; end < _gradients.at(layer + 1 + _gradients.size()).size(); end++) {
                        grad_out += _gradients.at(layer + 1 + _gradients.size()).at(end).at(out) * 
                            _layers.at(layer + 1 + _layers.size()).at(end).at(out) * 
                            _sigmoid_deriv(a.at(layer + 1 + a.size()).at(out));
                    }

                    for (int node = 0; node < _layer_counts.at(layer-1 + _layer_counts.size()); node++) {
                        _gradients.at(layer + _gradients.size()).at(out).at(node) = grad_out;
                        _change_by.at(layer + _change_by.size()).at(out).at(node) = grad_out * a.at(layer + a.size()).at(node);
                    }
                }
            }

            for (int layer = 0; layer < _layers.size(); layer++) {
                for (int node = 0; node < _layers.at(layer).size(); node++) {
                    for (int weight = 0; weight < _layers.at(layer).at(node).size(); weight++) {
                        _layers[layer][node][weight] += _learning_rate * _change_by.at(layer).at(node).at(weight);
                    }
                }
            }

            _completed_iterations++;
            return outputList;
        }

    public:
        NeuralNetwork() = default;

        void set_learning_rate(float rate) {
            _learning_rate = rate;
        }

        void set_layer_counts(emscripten::val js_layers) {
            _layer_counts = emscripten::convertJSArrayToNumberVector<int>(js_layers);
            _layers = _create_layer_structure(true);
            _gradients = _create_layer_structure(false);
            _change_by = _create_layer_structure(false);
        }

        std::vector<TrainingPair> training_pairs() {
            return _training_pair_list;
        }

        int add_training_pair(emscripten::val input_val, emscripten::val output_val) {
            _training_pair_list.push_back(TrainingPair(input_val, output_val));
            return 0;
        }   

        bool get_run_status() {
            return _training_switch;
        }

        int train(int count) {
            _training_switch = true;
            for (int i = 0; i < count; i++) {
                if (++_next_training_pair >= _training_pair_list.size()) {
                    _next_training_pair = 0;
                }
                _backpropagate(_training_pair_list.at(_next_training_pair).inputs(), _training_pair_list.at(_next_training_pair).output_entry(0));
            }

            return _completed_iterations;
        }

        void stop_training() {
            _training_switch = false;
            _print_weights();
        }
};

void sleep_and_print() {
    sleep(5);
    console << "Slept.";
    std::cout << std::endl;
}

int change_first(std::vector<int> &v) {
    v[0] = 10000;
    return 0;
}

int print_js_array(const emscripten::val &v) {
    std::vector<int> vec = emscripten::convertJSArrayToNumberVector<int>(v);
    for (int i : vec) {
        console << i << " ";
    }
    std::cout << std::endl;
    return 0;
}

EMSCRIPTEN_BINDINGS(neural_visual) {
    emscripten::function("change_first", &change_first);
    emscripten::function("printJSArray", &print_js_array);
    emscripten::class_<NeuralNetwork>("NeuralNetwork")
        .constructor()
        .function("setLearningRate", &NeuralNetwork::set_learning_rate)
        .function("setLayerCounts", &NeuralNetwork::set_layer_counts)
        .function("addTrainingPair", &NeuralNetwork::add_training_pair)
        .function("train", &NeuralNetwork::train)
        .function("stopTraining", &NeuralNetwork::stop_training)
        .function("getRunStatus", &NeuralNetwork::get_run_status);
    emscripten::function("sleepAndPrint", &sleep_and_print);
}

