import sys
import json
import random

SPLIT = 10

def check(x, y) :
    return int((x*x) + (y*y) < 1.0)

def main() :
    args = sys.argv[1:]
    pair_count = int(args[0])

    obj = {"data": []}

    # for i in range(SPLIT) :
    #     x = -1.5 + i*0.3
    #     for j in range(SPLIT) :
    #         y = -1.5 + j*0.3
    #         obj["data"].append({"in": [x, y, 1], "out": [check(x, y)]})

    for i in range(pair_count) :
        x = random.uniform(-1.5, 1.5)
        y = random.uniform(-1.5, 1.5)
        obj["data"].append({"in": [x, y], "out": [check(x, y)]})

    with open("dataset.json", "w") as f :
        json.dump(obj, f, indent=2)


if __name__ == '__main__' :
    main()