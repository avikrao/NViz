#include <iostream>
#include <emscripten/bind.h>

int print() {
    std::cout << "Hello, world!" << std::endl;        
    return 0;
}

EMSCRIPTEN_BINDINGS(neural_visual) {
    emscripten::function("print", &print);
}

