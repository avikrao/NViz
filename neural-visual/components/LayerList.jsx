import React, { useState, useEffect } from 'react';

const LayerNodeCount = ({layerNodeCount}) => {
    const [nodeCount, setnodeCount] = useState(layerNodeCount);

    const validateAndSetCount = (newCount) => {
        console.log("hi!");
    }

    return (
        <div className='flex flex-col w-16 border-teal-500 border-2 h-full rounded-xl overflow-hidden mr-2'>
            <div className='flex h-1/4 border-b-teal-500 border-b-2 text-white items-center justify-center cursor-pointer hover:bg-red-500'> 
                <p className='text-center'>—</p>
            </div>
            <div className='flex h-full text-white w-full'>
                <input type="text" className='bg-transparent text-center w-full' 
                    value={nodeCount} 
                    maxLength={3} 
                    onChange={event => validateAndSetCount(event.target.value)}>
                </input>
            </div>
        </div>
    );
}

const LayerList = ({inputs, outputs}) => {
    const [inputCount, setInputs] = useState(inputs);
    const [outputCount, setOutputs] = useState(outputs);

    const validateAndSetInput = (newInput) => {

        if (newInput === "") {
            setInputs(0);
            return;
        }

        const newInputNum = Number.parseInt(newInput);
        if (Number.isInteger(newInputNum) && newInputNum <= 256) {
            setInputs(newInputNum);
        }
    }

    const validateAndSetOutput = (newOutput) => {

        if (newOutput === "") {
            setOutputs(0);
            return;
        }

        const newOutputNum = Number.parseInt(newOutput);
        if (Number.isInteger(newOutputNum) && newOutputNum <= 256) {
            setOutputs(newOutputNum);
        }
    }

    return (
        <div className='flex flex-row w-full justify-start'>

            <div className='flex flex-row w-1/6 border-2 border-teal-700 rounded-xl items-center overflow-hidden mr-4'>
                <div className='flex w-1/2 bg-teal-700 text-gray-300 justify-center border-r-2 border-teal-700 h-full items-center'>
                    <p>Inputs:</p>
                </div>
                <div className='flex flex-col w-1/2 h-full'>
                    <div className="flex h-full">
                        <input type="text" className="flex w-full bg-transparent text-white shadow-none outline-none text-center text-xl" 
                            maxLength={3} 
                            value={inputCount}
                            onChange={event => {validateAndSetOutput(event.target.value)}}>
                        </input>
                    </div>
                </div>
            </div>

            <div className='layersBox flex flex-row border-2 border-red-400 w-2/3'>
                <LayerNodeCount></LayerNodeCount>
                <LayerNodeCount></LayerNodeCount>
                <LayerNodeCount></LayerNodeCount>
                <LayerNodeCount></LayerNodeCount>
            </div>

            <div className='flex flex-row w-1/6 border-2 border-teal-700 rounded-xl items-center overflow-hidden ml-auto' >
                <div className='flex w-1/2 bg-teal-700 text-gray-300 justify-center border-r-2 border-teal-700 h-full items-center text-sm'>
                    <p>Outputs:</p>
                </div>
                <div className='flex flex-col w-1/2 h-full'>
                    <div className="flex h-full">
                        <input type="text" className="flex w-full bg-transparent text-white shadow-none outline-none text-center text-xl" 
                            maxLength={3} 
                            value={outputCount}
                            onChange={event => {validateAndSetOutput(event.target.value)}}>
                        </input>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LayerList;