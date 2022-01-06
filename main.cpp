#include <iostream>
#include <emscripten/bind.h>
#include <unistd.h>
#define console std::cout << "[C++] "


class NeuralNetwork {
    private:

        float _learning_rate;
        std::vector<int> _layer_counts;
        std::vector<std::vector<std::vector<float>>> _layers;
        std::vector<std::vector<std::vector<float>>> _gradients;
        std::vector<std::vector<std::vector<float>>> _change_by;

        class TrainingPair {
            public: 

                TrainingPair(emscripten::val &input_val, emscripten::val &output_val) {
                    _input_vector = emscripten::convertJSArrayToNumberVector<float>(input_val);
                    _output_vector = emscripten::convertJSArrayToNumberVector<float>(output_val);
                }

                std::vector<float> inputs() {
                    return _input_vector;
                }

                std::vector<float> outputs() {
                    return _output_vector;
                }

            private:

                std::vector<float> _input_vector;
                std::vector<float> _output_vector;
        };

        std::vector<TrainingPair> _training_pair_list;

    public:

        NeuralNetwork() = default;

        int set_layer_counts(emscripten::val js_layers) {
            _layer_counts = emscripten::convertJSArrayToNumberVector<int>(js_layers);
            return 0;
        }

        std::vector<TrainingPair> training_pairs() {
            return _training_pair_list;
        }

        int add_training_pair(emscripten::val input_val, emscripten::val output_val) {
            _training_pair_list.push_back(TrainingPair(input_val, output_val));
            return 0;
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
        .function("setLayerCounts", &NeuralNetwork::set_layer_counts)
        .function("addTrainingPair", &NeuralNetwork::add_training_pair);
    emscripten::function("sleepAndPrint", &sleep_and_print);
}

