import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, { Background } from 'react-flow-renderer';
import LayerList from '../components/LayerList';
import FlowInputNode from '../components/FlowInputNode';
import FlowBiasNode from '../components/FlowBiasNode';
import FlowOutputNode from '../components/FlowOutputNode';
import FlowLayerNode from '../components/FlowLayerNode';

const learningRateLimits = [0.01, 0.5];
const trainingSpeedLimits = [1, 100000];

const nodes = [
  {
    id: '1',
    type: 'inputNode',
    data: { label: 'Node 1' },
    position: { x: 100, y: 100 }
  },
  {
    id: '2',
    type: 'biasNode',
    data: { label: 'Node 2' },
    position: { x: 100, y: 200 }
  },
  {
    id: '3',
    type: 'layerNode',
    data: { label: 'Node 3' },
    position: { x: 200, y: 150 }
  },
  {
    id: '4',
    type: 'outputNode',
    data: { label: 'Node 4' },
    position: { x: 300, y: 150 }
  }
]

export default function Index() {

  const [learningRate, setLearningRate] = useState(0.1);
  const [trainingSpeed, setTrainingSpeed] = useState(100000);
  const [fileVisible, setFileVisibility] = useState(false);
  const [layerList, setLayerList] = useState([2, 5, 3]);

  const worker = useRef();
  const textLearningRate = useRef();
  const textTrainingSpeed = useRef();

  useEffect(() => {
    worker.current = new Worker("worker.js");
  }, []);

  const setLearningRateSlider = (newRate) => {
    setLearningRate(newRate);
    textLearningRate.current.value = newRate;
  }

  const setTrainingSpeedSlider = (newSpeed) => {
    setTrainingSpeed(newSpeed);
    textTrainingSpeed.current.value = newSpeed;
  }

  const validateLearningRate = (newRate) => {
    const newRateNum = Number.parseFloat(newRate);
    if (Number.isFinite(newRateNum) && newRateNum <= learningRateLimits[1] && newRateNum >= learningRateLimits[0]) {
      setLearningRate(newRateNum);
      textLearningRate.current.value = newRateNum;
    } else {
      textLearningRate.current.value = learningRate;
    }
  }

  const validateTrainingSpeed = (newSpeed) => {
    const newSpeedNum = Number.parseFloat(newSpeed);
    if (Number.isInteger(newSpeedNum) && newSpeedNum <= trainingSpeedLimits[1] && newSpeedNum >= trainingSpeedLimits[0]) {
      setTrainingSpeed(newSpeedNum);
      textTrainingSpeed.current.value = newSpeedNum;
    } else {
      textTrainingSpeed.current.value = trainingSpeed;
    }
  }

  return (

    <div className='site flex flex-col h-screen'>

      <div className='flex flex-row w-full bg-gray-900 h-20 items-center'>
        <div className='ml-6 mr-6'>
          <a href="#" className='text-white text-2xl'>Neural Visualisation</a>
        </div>
        <div className='items-center w-1/3'>
          <a className='text-white text-base hover:text-teal-400 hover:cursor-pointer mr-4'>
            About
          </a>
          <a className='text-white text-base hover:text-teal-400 hover:cursor-pointer'>
            Input Format
          </a>
        </div>
      </div>

      <div className='flex w-full bg-gray-900 h-40 items- border-y-2 border-teal-900'>

        <div className="w-1/6 flex flex-col">
          <label className='uppercase text-teal-600 text-sm ml-6 mt-2 h-1/6'>Input file</label>
          <input type="file" className={`ml-6 my-2 h-full text-white hover:cursor-pointer ${fileVisible ? "" : "text-transparent"}`} onChange={() => setFileVisibility(true)}></input>
        </div>

        <div className="w-1/2 flex flex-col">
          <p className='flex uppercase text-teal-600 text-sm mt-2'>Layers</p>
          <div className='flex flex-row h-1/2 mt-1'>
            <LayerList className="flex flex-row" inputs={3} outputs={1} layers={layerList} onLayersSet={setLayerList}></LayerList>
          </div>
        </div>

        <div className='flex w-1/6 h-full justify-center'>
          <div className='flex flex-col h-full justify-center w-5/6 text-white mt-1'>
            <label className='uppercase text-teal-600 text-sm mb-1'>Learning Rate</label>
            <div className='flex flex-row mb-1'>
              <input type="range" className="range range-accent w-5/6" max={learningRateLimits[1]} min={learningRateLimits[0]} onChange={event => setLearningRateSlider(event.target.value)} step={0.001} value={learningRate}></input>
              <input type="text" className=' ml-4 w-1/3 bg-transparent' defaultValue={learningRate} ref={textLearningRate} onBlur={event => validateLearningRate(event.target.value)}></input>
            </div>

            <label className='uppercase text-teal-600 text-sm mb-1'>Training Speed</label>
            <div className='flex flex-row mb-1'>
              <input type="range" className="range range-accent w-2/3" max={trainingSpeedLimits[1]} min={trainingSpeedLimits[0]} onChange={event => setTrainingSpeedSlider(event.target.value)} value={trainingSpeed}></input>
              <input type="text" className=' ml-4 w-1/3 bg-transparent' defaultValue={trainingSpeed} ref={textTrainingSpeed} onBlur={event => validateTrainingSpeed(event.target.value)}></input>
            </div>
          </div>
        </div>

        <div className='flex w-1/6 items-center justify-center'>
          <div className='w-2/3 h-3/5 border-teal-500 border-2 rounded-2xl text-center text-white hover:bg-teal-500 hover:text-gray-800 cursor-pointer'>
            <p className='flex text-center h-full items-center justify-center text-2xl'>TRAIN</p>
          </div>
        </div>

      </div>

      <div className="h-full">
        <ReactFlow className="bg-gray-900" elements={nodes} nodeTypes={{inputNode: FlowInputNode, biasNode: FlowBiasNode, outputNode: FlowOutputNode, layerNode: FlowLayerNode}}>
          <Background color="#fff"/>
        </ReactFlow>
      </div>

    </div>  
  );
}