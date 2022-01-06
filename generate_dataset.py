import sys
import json
import random

def main() :
    args = sys.argv[1:]
    pair_count = int(args[0])
    input_count = int(args[1])
    output_count = int(args[2])

    obj = {"data": []}
    for pair_num in range(pair_count) :
        inputs = [random.random() for i in range(input_count)]
        outputs = [random.random() for j in range(output_count)]
        obj["data"].append({"in": inputs, "out": outputs})

    with open("dataset.json", "w") as f :
        json.dump(obj, f, indent=2)


if __name__ == '__main__' :
    main()