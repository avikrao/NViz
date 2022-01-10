import React, { useState, useEffect, useRef } from 'react';

const LayerNodeCount = ({ layerIndex, destructor, count, onUpdate}) => {
    const [nodeCount, setNodeCount] = useState(count);

    const validateAndSetCount = (newCount) => {
        if (newCount === "") {
            setNodeCount(0);
            return;
        }

        const newCountNum = Number.parseInt(newCount);
        if (Number.isInteger(newCountNum) && newCountNum <= 256 && newCountNum > 0) {
            setNodeCount(newCountNum);
            onUpdate(layerIndex, newCountNum);
        }
    }

    return (
        <div className='flex flex-col w-16 border-teal-500 border-2 h-full rounded-xl overflow-hidden mr-3'>
            <div className='flex h-1/4 border-b-teal-500 border-b-2 text-white items-center justify-center cursor-pointer hover:bg-red-500'
                onClick={() => destructor(layerIndex)}> 
                <p className='text-center'>—</p>
            </div>
            <div className='flex h-full text-white w-full'>
                <input type="text" className='bg-transparent text-center w-full outline-none' 
                    value={nodeCount} 
                    maxLength={3} 
                    onChange={event => validateAndSetCount(event.target.value)}>
                </input>
            </div>
        </div>
    );
}

const NewLayerButton = ({onAdd}) => {
    
    return (
        <div className='flex w-12 h-3/4 border-teal-500 border-2 rounded-xl mr-3 text-white items-center justify-center hover:bg-teal-500 cursor-pointer hover:text-teal-900'
            onClick={() => onAdd()}>
            <p className='text-center text-3xl h-full items-center justify-center m-auto border-2 border-transparent w-full'>+</p>
        </div>
    );
}

const LayerList = ({inputs, outputs}) => {
    const [inputCount, setInputs] = useState(inputs);
    const [outputCount, setOutputs] = useState(outputs);
    const [layerCounts, setLayers] = useState([2, 3, 5]);
    const [canAdd, setCanAdd] = useState(true);

    const keyCount = useRef(0);

    const validateAndSetInput = (newInput) => {

        if (newInput === "") {
            setInputs(0);
            return;
        }

        const newInputNum = Number.parseInt(newInput);
        if (Number.isInteger(newInputNum) && newInputNum <= 256 && newInputNum > 0) {
            setInputs(newInputNum);
        }
    }

    const validateInputOnBlur = (inputValue) => {
        if (inputValue < 1 || inputValue > 256) {
            setInputs(1);
        }
    }

    const validateAndSetOutput = (newOutput) => {

        if (newOutput === "") {
            setOutputs(0);
            return;
        }

        const newOutputNum = Number.parseInt(newOutput);
        if (Number.isInteger(newOutputNum) && newOutputNum <= 256 && newOutputNum > 0) {
            setOutputs(newOutputNum);
        }
    }

    const validateOutputOnBlur = (outputValue) => {
        if (outputValue < 1 || outputValue > 256) {
            setOutputs(1);
        }
    }

    const addNewLayer = () => {
        setLayers([...layerCounts, 1]);
        if (layerCounts.length >= 7) {
            setCanAdd(false);
        }
    }

    const deleteLayer = (layerIndex) => {
        setLayers(layerCounts.filter((count, index) => index != layerIndex));
        if (layerCounts.length <= 8) {
            setCanAdd(true);
        }
    }

    const updateCount = (layerIndex, newCount) => {
        const updatedLayers = Array.from(layerCounts);
        updatedLayers[layerIndex] = newCount;
        setLayers([...updatedLayers]);
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
                            onChange={event => {validateAndSetInput(event.target.value)}}
                            onBlur={event => {validateInputOnBlur(event.target.value)}}>
                        </input>
                    </div>
                </div>
            </div>

            <div className='layersBox flex flex-row border-red-400 w-2/3 items-center'>
                {layerCounts.map((count, index) => <LayerNodeCount layerIndex={index} destructor={deleteLayer} count={count} onUpdate={updateCount} key={keyCount.current++}/>)}
                {canAdd && <NewLayerButton onAdd={addNewLayer}></NewLayerButton>}
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
                            onChange={event => {validateAndSetOutput(event.target.value)}}
                            onBlur={event => {validateOutputOnBlur(event.target.value)}}>
                        </input>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LayerList;