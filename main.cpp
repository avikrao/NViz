#include <iostream>
#include <emscripten/bind.h>
#define console std::cout << "[C++]"

class TrainingPair {
public: 

    TrainingPair(emscripten::val input_val, emscripten::val output_val) {
        input_vector = emscripten::convertJSArrayToNumberVector<float>(input_val);
        output_vector = emscripten::convertJSArrayToNumberVector<float>(output_val);
    }

    std::vector<float> inputs() {
        return input_vector;
    }

    std::vector<float> outputs() {
        return output_vector;
    }

private:
    std::vector<float> input_vector;
    std::vector<float> output_vector;
};

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
    emscripten::class_<TrainingPair>("TrainingPair")
        .constructor<emscripten::val, emscripten::val>()
        .function("inputs", &TrainingPair::inputs)
        .function("outputs", &TrainingPair::outputs);
    emscripten::register_vector<TrainingPair>("TrainingPairList");
}

