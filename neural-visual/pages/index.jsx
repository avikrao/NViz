import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, { addEdge, Background } from 'react-flow-renderer';
import linspace from "exact-linspace";
import chroma from "chroma-js";
import LayerList from '../components/LayerList';
import FlowInputNode from '../components/FlowInputNode';
import FlowBiasNode from '../components/FlowBiasNode';
import FlowOutputNode from '../components/FlowOutputNode';
import FlowLayerNode from '../components/FlowLayerNode';
import { MessageCode, ReturnCode } from '../public/codes';

const learningRateLimits = [0.01, 0.5];
const trainingSpeedLimits = [1, 100000];

const colorScale = chroma.scale(["#f00", "#0f0"]);

export default function Index() {

  const [learningRate, setLearningRate] = useState(0.1);
  const [trainingSpeed, setTrainingSpeed] = useState(100000);
  const [fileVisible, setFileVisibility] = useState(false);
  const [layerList, setLayerList] = useState([3, 2, 5, 3, 1]);
  const [elementList, setElementList] = useState();
  const nodeIdTracker = useRef(1);
  const edgeIdTracker = useRef(1);
  const [nodeMatrix, setNodeMatrix] = useState();

  const nodeList = useRef();
  const edgeMatrix = useRef();
  const edgeList = useRef();

  const [trainingState, setTrainingState] = useState(false);

  const worker = useRef(null);
  const textLearningRate = useRef();
  const textTrainingSpeed = useRef();

  useEffect(() => {
    worker.current = new Worker("worker.js");
    worker.current.addEventListener("message", message => {
      switch(message.data.code) {
        case ReturnCode.ModuleReady :
          worker.current.postMessage({code: MessageCode.LayersSet, layers: layerList});
          
          worker.current.postMessage({
            code: MessageCode.ValuesUpdate, 
            learningRate: learningRate, 
            trainingSpeed: trainingSpeed
          });
          return;
        case ReturnCode.StartSuccess :
          setTrainingState(true);
          return;
        case ReturnCode.StoppedTraining :
          setTrainingState(false);
          return;
        case ReturnCode.TrainingUpdate :
          if (message.data.weights) {
            updateWeights(message.data.layers, message.data.weights);
            // console.log(message.data.weights);
            // console.log(edgeMatrix.current);
          }
      }
    });
  }, []);

  useEffect(() => {

    const newNodes = [];
    const newEdges = [];
    const newNodeMatrix = [[]];
    const newEdgeMatrix = [];
    let newElements = [];
    let maxHeight = Math.max(...layerList) * 100;
    maxHeight = Math.max(((layerList[0] + 1) * 100), maxHeight); // account for bias
    let xCord = 100;
    let nodeIdCount = 0;
    let edgeIdCount = 0;

    const inputsSpace = linspace(0, maxHeight, layerList[0]+3);
    for (let j = 1; j < inputsSpace.length - 2; j++) {
      let nodeId = nodeIdTracker.current++;
      newNodes.push({
        id: nodeId.toString(),
        type: "inputNode",
        position: {x: xCord, y: inputsSpace[j]}
      });
      newNodeMatrix[0].push(nodeId.toString());
    }

    let biasNodeId = nodeIdTracker.current++;
    newNodes.push({
      id: biasNodeId.toString(),
      type: "biasNode",
      position: {x: xCord, y: inputsSpace[inputsSpace.length-2]}
    });
    newNodeMatrix[0].push(biasNodeId.toString());

    for (let i = 1; i < layerList.length - 1; i++) {
      xCord += 200;
      let spaced = linspace(0, maxHeight, layerList[i]+2);
      newNodeMatrix.push([]);
      for (let j = 1; j < spaced.length - 1; j++) {
        let nodeId = nodeIdTracker.current++;
        newNodes.push({
          id: nodeId.toString(),
          type: "layerNode",
          position: {x: xCord, y: spaced[j]}
        });
        newNodeMatrix[newNodeMatrix.length-1].push(nodeId.toString());
      }
    }

    xCord += 200;
    const outputsSpace = linspace(0, maxHeight, layerList[layerList.length-1]+2);
    newNodeMatrix.push([]);
    for (let j = 1; j < outputsSpace.length - 1; j++) {
      let nodeId = nodeIdTracker.current++;
      newNodes.push({
        id: nodeId.toString(),
        type: "outputNode",
        position: {x: xCord, y: outputsSpace[j]}
      });
      newNodeMatrix[newNodeMatrix.length-1].push(nodeId.toString());
    }

    newElements = newElements.concat(newNodes);

    for (let i = 0; i < newNodeMatrix.length - 1; i++) {
      newEdgeMatrix.push([]);
      for (let j = 0; j < newNodeMatrix[i+1].length; j++) {
        newEdgeMatrix[i].push([]);
        for (let k = 0; k < newNodeMatrix[i].length; k++) {
          newEdgeMatrix[i][j].push(edgeIdTracker.current++);
        }
      }
    }

    for (let i = 0; i < newEdgeMatrix.length; i++) {
      for (let j = 0; j < newEdgeMatrix[i].length; j++) {
        for (let k = 0; k < newEdgeMatrix[i][j].length; k++) {
          newEdges = addEdge({
            id: newEdgeMatrix[i][j][k].toString(),
            type: 'straight',
            source: newNodeMatrix[i][k],
            target: newNodeMatrix[i+1][j]
          }, newEdges);
        }
      }
    }

    newElements = newElements.concat(newEdges);

    worker.current.postMessage({code: MessageCode.LayersSet, layers: layerList});

    setNodeMatrix(newNodeMatrix);
    edgeMatrix.current = newEdgeMatrix;

    nodeList.current = newNodes;
    edgeList.current = newEdges;
    setElementList(newElements);

    console.log(newElements);

  }, [layerList, fileVisible]);

  useEffect(() => {
    worker.current.postMessage({
      code: MessageCode.ValuesUpdate, 
      learningRate: learningRate, 
      trainingSpeed: trainingSpeed,
    });
  }, [learningRate, trainingSpeed]);

  const updateWeights = (layers, weights) => {

    const oldEdges = edgeMatrix.current;
    const newEdges = [];
    const flattenedWeights = weights.flat(Infinity),
      maxWeight = Math.max(...flattenedWeights),
      minWeight = Math.min(...flattenedWeights),
      scale = maxWeight - minWeight;

    let newElements = [...nodeList.current];
    
    let edgeCounter = 0;

    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights[i].length; j++) {
        for (let k = 0; k < weights[i][j].length; k++) {
          newEdges = addEdge({
            id: (edgeIdTracker.current++).toString(),
            type: 'straight',
            source: edgeList.current[edgeCounter].source,
            target: edgeList.current[edgeCounter++].target,
            style: {
              stroke: colorScale((weights[i][j][k] - minWeight)/(scale)).toString(),
            }
          }, newEdges)
        }
      }
    }

    newElements = newElements.concat(newEdges);
    edgeList.current = newEdges;

    setElementList([...nodeList.current, ...newEdges]);
  }

  const onFileUpload = async (fileList) => {
    setFileVisibility(false);
    const latestFile = fileList[fileList.length-1];
    const reader = new FileReader();
    reader.readAsText(latestFile);
    reader.addEventListener("load", async (event) => {
      const dataAsJson = JSON.parse(event.target.result);
      worker.current.postMessage({code: MessageCode.FileUpload, file: dataAsJson});
    });
  }

  const setLearningRateSlider = (newRate) => {
    setLearningRate(Number.parseFloat(newRate));
    textLearningRate.current.value = newRate;
  }

  const setTrainingSpeedSlider = (newSpeed) => {
    setTrainingSpeed(Number.parseInt(newSpeed));
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

  const startTraining = () => {
    worker.current.postMessage({code: MessageCode.StartTraining});
  }

  const stopTraining = () => {
    console.log(elementList);
    worker.current.postMessage({code: MessageCode.StopTraining});
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
          <input type="file" 
            className={`ml-6 my-2 h-full text-white hover:cursor-pointer ${fileVisible ? "" : "text-transparent"}`} 
            onChange={event => onFileUpload(event.target.files)}>
          </input>
        </div>

        <div className="w-1/2 flex flex-col">
          <p className='flex uppercase text-teal-600 text-sm mt-2'>Layers</p>
          <div className='flex flex-row h-1/2 mt-1'>
            <LayerList 
              className="flex flex-row" 
              inputs={layerList[0]} 
              outputs={layerList[layerList.length-1]} 
              layers={layerList.slice(1, layerList.length-1)} 
              onLayersSet={setLayerList}>
            </LayerList>
          </div>
        </div>

        <div className='flex w-1/6 h-full justify-center'>
          <div className='flex flex-col h-full justify-center w-5/6 text-white mt-1'>
            <label className='uppercase text-teal-600 text-sm mb-1'>Learning Rate</label>
            <div className='flex flex-row mb-1'>
              <input 
                type="range" 
                className="range range-accent w-5/6" 
                max={learningRateLimits[1]} 
                min={learningRateLimits[0]} 
                onChange={event => setLearningRateSlider(event.target.value)} 
                step={0.001} 
                value={learningRate}>
              </input>
              <input 
                type="text" 
                className=' ml-4 w-1/3 bg-transparent text-sm' 
                defaultValue={learningRate} 
                ref={textLearningRate} 
                onBlur={event => validateLearningRate(event.target.value)}>
              </input>
            </div>

            <label className='uppercase text-teal-600 text-sm mb-1'>Training Speed</label>
            <div className='flex flex-row mb-1'>
              <input 
                type="range" 
                className="range range-accent w-2/3" 
                max={trainingSpeedLimits[1]} 
                min={trainingSpeedLimits[0]} 
                onChange={event => setTrainingSpeedSlider(event.target.value)} 
                value={trainingSpeed}>
              </input>
              <input 
                type="text" 
                className=' ml-4 w-1/3 bg-transparent text-sm' 
                defaultValue={trainingSpeed} 
                ref={textTrainingSpeed} 
                onBlur={event => validateTrainingSpeed(event.target.value)}>
              </input>
            </div>
          </div>
        </div>

        <div className='flex w-1/6 items-center justify-center'>
          
          {!trainingState && <button
            className='w-2/3 h-3/5 border-teal-500 border-2 rounded-2xl text-center text-white hover:bg-teal-500 hover:text-gray-800 cursor-pointer' 
            onClick={startTraining}>
            <p className='flex text-center h-full items-center justify-center text-2xl'>TRAIN</p>
          </button>}

          {trainingState && <button
            className='w-2/3 h-3/5 border-red-500 border-2 rounded-2xl text-center text-white hover:bg-red-500 cursor-pointer' 
            onClick={stopTraining}>
            <p className='flex text-center h-full items-center justify-center text-2xl'>STOP</p>
          </button>}
        </div>

      </div>

      <div className="h-full">
        <ReactFlow 
          className="flex bg-gray-900 relative" 
          elements={elementList} 
          nodeTypes={{inputNode: FlowInputNode, biasNode: FlowBiasNode, outputNode: FlowOutputNode, layerNode: FlowLayerNode}}>
          <Background color="#fff"/>
          {/* <div className='absolute top-0 right-0 w-1/6 h-1/6 border-2 border-teal-900 border-t-0 bg-gray-900'></div> */}
        </ReactFlow>
      </div>

    </div>  
  );
}