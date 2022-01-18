import React, { useState, useEffect, useRef } from 'react';

const LayerNodeCount = ({ layerIndex, destructor, count, onUpdate, editable}) => {
    const [nodeCount, setNodeCount] = useState(count);

    const validateAndSetCount = (newCount) => {
        if (newCount === "") {
            setNodeCount(0);
            return;
        }

        const newCountNum = Number.parseInt(newCount);
        if (Number.isInteger(newCountNum) && newCountNum <= 1000 && newCountNum > 0) {
            setNodeCount(newCountNum);
            onUpdate(layerIndex, newCountNum);
        }
    }

    const checkForEnter = (event) => {
        if (event.keyCode === 13 && editable) {
            validateAndSetCount(event.target.value);
        }
    }

    return (
        <div className='flex flex-col w-16 border-teal-500 border-2 h-full rounded-xl overflow-hidden mr-3'>
            {editable && 
                <div className='flex h-1/4 border-b-teal-500 border-b-2 text-white items-center justify-center cursor-pointer hover:bg-red-500'
                    onClick={() => destructor(layerIndex)}> 
                    <p className='text-center'>—</p>
                </div>
            }
            {!editable && 
                <div 
                    className='flex h-1/4 border-b-teal-500 border-b-2 text-white items-center justify-center cursor-not-allowed' 
                    title='Cannot remove layers during training'> 
                    <p className='text-center'>—</p>
                </div>
            }
            <div className='flex h-full text-white w-full'>
                <input type="text" className={`bg-transparent text-center w-full outline-none ${editable ? "" : "cursor-not-allowed"}`}
                    defaultValue={nodeCount} 
                    maxLength={4} 
                    onBlur={event => validateAndSetCount(event.target.value)}
                    onKeyDown={event => checkForEnter(event)}
                    disabled={!editable}
                    title={editable ? "" : "Cannot change layers during training"}>
                </input>
            </div>
        </div>
    );
}

const NewLayerButton = ({onAdd, editable}) => {
    
    if (editable) {
        return (
            <button className='flex w-12 h-3/4 border-teal-500 border-2 rounded-xl mr-3 text-white items-center justify-center hover:bg-teal-500 cursor-pointer hover:text-teal-900'
                onClick={() => onAdd()}>
                <p className='text-center text-3xl h-full items-center justify-center m-auto border-2 border-transparent w-full'>+</p>
            </button>
        );
    } else {
        return (
            <button className='flex w-12 h-3/4 border-teal-500 border-2 rounded-xl mr-3 text-white items-center justify-center cursor-not-allowed'
                title='Cannot add new layers during training'>
                <p className='text-center text-3xl h-full items-center justify-center m-auto border-2 border-transparent w-full'>+</p>
            </button>
        );
    }
}

const LayerList = ({inputs, outputs, layers, onLayersSet, editable}) => {
    const [inputCount, setInputs] = useState(inputs);
    const [outputCount, setOutputs] = useState(outputs);
    const [layerCounts, setLayers] = useState(layers);
    const [canAdd, setCanAdd] = useState(true);

    const keyCount = useRef(0);

    useEffect(() => {
        onLayersSet([inputCount, ...layerCounts, outputCount]);
    }, [layerCounts, outputCount, inputCount, onLayersSet])

    const validateAndSetInput = (newInput) => {

        if (newInput === "") {
            setInputs(0);
            return;
        }

        const newInputNum = Number.parseInt(newInput);
        if (Number.isInteger(newInputNum) && newInputNum <= 1000 && newInputNum > 0) {
            setInputs(newInputNum);
        }
    }

    const validateInputOnBlur = (inputValue) => {
        if (inputValue < 1 || inputValue > 1000) {
            setInputs(1);
        }
    }

    const validateAndSetOutput = (newOutput) => {

        if (newOutput === "") {
            setOutputs(0);
            return;
        }

        const newOutputNum = Number.parseInt(newOutput);
        if (Number.isInteger(newOutputNum) && newOutputNum <= 1000 && newOutputNum > 0) {
            setOutputs(newOutputNum);
        }
    }

    const validateOutputOnBlur = (outputValue) => {
        if (outputValue < 1 || outputValue > 1000) {
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

            <div className='flex flex-row w-1/6 border-2 border-teal-700 rounded-xl items-center overflow-hidden mr-4 shrink'>
                <div className='flex w-3/5 bg-teal-700 text-gray-300 justify-center border-r-2 border-teal-700 h-full items-center text-sm'>
                    <p className='w-full text-center items-center justify-center break-all'>Inputs</p>
                </div>
                <div className='flex flex-col w-2/5 h-full'>
                    <div className="flex h-full">
                        <input type="text" 
                            className={`flex w-full bg-transparent text-white shadow-none outline-none text-center text-xl ${editable ? "" : "cursor-not-allowed"}`}
                            maxLength={4} 
                            value={inputCount}
                            onChange={event => {validateAndSetInput(event.target.value)}}
                            onBlur={event => {validateInputOnBlur(event.target.value)}}
                            disabled={!editable}
                            title={editable ? "" : "Cannot change layers during training"}>
                        </input>
                    </div>
                </div>
            </div>

            <div className='layersBox flex flex-row border-red-400 w-2/3 items-center shrink'>
                {layerCounts.map((count, index) => 
                    <LayerNodeCount 
                        layerIndex={index} 
                        destructor={deleteLayer} 
                        count={count} 
                        onUpdate={updateCount} 
                        key={keyCount.current++}
                        editable={editable}/>
                )}
                {canAdd && <NewLayerButton onAdd={addNewLayer} editable={editable}></NewLayerButton>}
            </div>

            <div className='flex flex-row w-1/6 border-2 border-teal-700 rounded-xl items-center overflow-hidden ml-auto shrink' >
                <div className='flex flex-shrink-0 w-3/5 bg-teal-700 text-gray-300 justify-center border-r-2 border-teal-700 h-full items-center text-sm'>
                    <p className='w-full justify-center items-center text-center break-all'>Outputs</p>
                </div>
                <div className='flex flex-col w-2/5 h-full'>
                    <div className="flex h-full">
                        <input type="text" 
                            className={`flex w-full bg-transparent text-white shadow-none outline-none text-center text-xl ${editable ? "" : "cursor-not-allowed"}`}
                            maxLength={4} 
                            value={outputCount}
                            onChange={event => {validateAndSetOutput(event.target.value)}}
                            onBlur={event => {validateOutputOnBlur(event.target.value)}}
                            disabled={!editable}
                            title={editable ? "" : "Cannot change layers during training"}>
                        </input>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LayerList;