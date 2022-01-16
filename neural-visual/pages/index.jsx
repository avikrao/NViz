import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, { addEdge, Background, Controls } from 'react-flow-renderer';
import linspace from "exact-linspace";
import chroma from "chroma-js";
import LayerList from '../components/LayerList';
import FlowInputNode from '../components/FlowInputNode';
import FlowBiasNode from '../components/FlowBiasNode';
import FlowOutputNode from '../components/FlowOutputNode';
import FlowLayerNode from '../components/FlowLayerNode';
import ErrorModal from '../components/ErrorModal';
import { MessageCode, ReturnCode } from '../public/codes';

const learningRateLimits = [0.01, 0.5];
const trainingSpeedLimits = [1, 100000];

const colorScale = chroma.scale(["#f00", "#0f0"]);

export default function Index() {

  const [learningRate, setLearningRate] = useState(0.1);
  const [trainingSpeed, setTrainingSpeed] = useState(100000);
  const [layerList, setLayerList] = useState([3, 2, 5, 3, 1]);
  const [elementList, setElementList] = useState();
  const [epochs, setEpochs] = useState(0);
  const [error, setError] = useState(0.0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCode, setModalCode] = useState();

  const nodeList = useRef();
  const nodeMatrix = useRef();

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
          if (message.data.weights) {
            updateWeights(message.data.weights, false);
          }
          setTrainingState(false);
          return;
        case ReturnCode.TrainingUpdate :
          if (message.data.weights) {
            setEpochs(message.data.epochs);
            setError(message.data.error);
            updateWeights(message.data.weights, true);
          }
          return;
        case ReturnCode.JSONSuccess :
          return;
        default :
          setModalCode(message.data.code);
          setModalOpen(true);
          return;
      }
    });
  }, []);

  useEffect(() => {
    if (layerList.includes(0)) { return; }

    const layersWithBias = [layerList[0] + 1, ...layerList.slice(1)];
    const maxLayer = Math.max(...layersWithBias);

    const newNodes = [];
    const newNodeMatrix = [];
    let newEdges = [];

    let xCord = 100;
    let nodeId = 1;
    for (const [layerIndex, layerCount] of layersWithBias.entries()) {
      newNodeMatrix.push([]);
      if (layerIndex == 0) {
        const space = linspace(0, (maxLayer*100), layerCount+2);
        for (let i = 1; i < space.length - 2; i++) {
          newNodes.push({
            id: nodeId.toString(),
            type: "inputNode",
            draggable: false,
            position: {x: xCord, y: space[i]}
          });
          newNodeMatrix[newNodeMatrix.length - 1].push(nodeId++);
        }

        newNodes.push({
          id: nodeId.toString(),
          type: "biasNode",
          draggable: false,
          position: {x: xCord, y: space[space.length-2]}
        })
        newNodeMatrix[newNodeMatrix.length - 1].push(nodeId++);
        xCord += 200;
      } else if (layerIndex != layerList.length-1) {

        const space = linspace(0, (maxLayer*100), layerCount+2);
        for (let i = 1; i < space.length - 1; i++) {
          newNodes.push({
            id: nodeId.toString(),
            type: "layerNode",
            draggable: false,
            position: {x: xCord, y: space[i]}
          });
          newNodeMatrix[newNodeMatrix.length - 1].push(nodeId++);
        }

        xCord += 200;

      } else {
        const space = linspace(0, maxLayer*100, layerCount+2);
        for (let i = 1; i < space.length - 1; i++) {
          newNodes.push({
            id: nodeId.toString(),
            type: "outputNode",
            draggable: false,
            position: {x: xCord, y: space[i]}
          });
          newNodeMatrix[newNodeMatrix.length - 1].push(nodeId++);
        }
      }
    }

    let edgeCount = 0;
    for (let i = 0; i < newNodeMatrix.length - 1; i++) {
      for (let j = 0; j < newNodeMatrix[i].length; j++) {
        for (let k = 0; k < newNodeMatrix[i+1].length; k++) {
          newEdges = addEdge({
            id: edgeCount.toString(),
            type: 'straight',
            // animated: true,
            source: newNodeMatrix[i][j].toString(),
            target: newNodeMatrix[i+1][k].toString(),
            style: { stroke: "#fff" },
          },newEdges);
          edgeCount++;
        }
      }
    }

    nodeMatrix.current = newNodeMatrix;
    nodeList.current = newNodes;
    setElementList([...newNodes, ...newEdges]);
    worker.current.postMessage({code: MessageCode.LayersSet, layers: layerList});
  }, [layerList]);


  useEffect(() => {
    worker.current.postMessage({
      code: MessageCode.ValuesUpdate, 
      learningRate: learningRate, 
      trainingSpeed: trainingSpeed,
    });
  }, [learningRate, trainingSpeed]);

  const updateWeights = (weights, running) => {

    console.log(weights);

    const flattenedweights = weights.flat(Infinity),
      maxWeight = Math.max(...flattenedweights),
      minWeight = Math.min(...flattenedweights),
      scale = maxWeight - minWeight;

    const newEdges = [];
    let edgeId = 0;

    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights[i].length; j++) {
        for (let k = 0; k < weights[i][j].length; k++) {
          newEdges = addEdge({
            id: edgeId.toString(),
            type: "straight",
            animated: running, 
            source: nodeMatrix.current[i][k].toString(),
            target: nodeMatrix.current[i+1][j].toString(),
            style: {
              stroke: colorScale((weights[i][j][k] - minWeight)/(scale)).toString(),
            },
          }, newEdges);
          edgeId++;
        }
      }
    }

    console.log([...nodeList.current, ...newEdges]);
    setElementList([...nodeList.current, ...newEdges]);
  }

  const onTrainingUpload = async (fileList) => {
    const latestFile = fileList[fileList.length-1];

    if (latestFile.type !== "application/json") {
      console.log(latestFile.type);
      return;
    }

    const reader = new FileReader();
    reader.readAsText(latestFile);
    reader.addEventListener("load", async (event) => {
      const dataAsJson = JSON.parse(event.target.result);
      if (!dataAsJson?.data?.length) {
        console.log(dataAsJson);
        return;
      }
      worker.current.postMessage({code: MessageCode.TrainingUpload, file: dataAsJson});
    });
  }

  const onInputUpload = async (fileList) => {
    const uploadedFile = fileList[0];
    if (uploadedFile.type === "application/json") {
      // error!
      return;
    }

    const reader = new FileReader();
    reader.readAsText(latestFile);
    reader.addEventListener("load", async (event) => {
      const dataAsJson = JSON.parse(event.target.result);
      if (!dataAsJson?.inputs?.length) {
        // error!
        return;
      }
      worker.current.postMessage({code: MessageCode.InputUpload, file: dataAsJson});
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

  const onModalClose = () => {
    setModalOpen(false);
  }

  return (

    <div className='site flex flex-col h-screen'>
      <ErrorModal open={modalOpen} onClose={onModalClose} error={modalCode}></ErrorModal>
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
          <label className='uppercase text-teal-600 text-sm ml-6 mt-2 h-1/6'>Training Data</label>
          <input type="file" 
            className={`ml-6 my-2 h-full text-white hover:cursor-pointer`} 
            onChange={event => onTrainingUpload(event.target.files)}>
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
              onLayersSet={setLayerList}
              editable={!trainingState}>
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

      <div className="flex flex-row h-full relative">
        <div className='w-5/6 h-full'>
          <ReactFlow 
            className="flex bg-gray-900 h-full w-full" 
            elements={elementList} 
            nodeTypes={{inputNode: FlowInputNode, biasNode: FlowBiasNode, outputNode: FlowOutputNode, layerNode: FlowLayerNode}}>
            <Background color="#fff"/>
            <Controls/>
          </ReactFlow>
        </div>
        
        <div className='w-1/6 border-2 border-teal-900 h-full bg-gray-900 border-t-0 flex flex-col text-white'>
          <div className='flex flex-col h-1/3 border-b-2 border-teal-700'>
            <div className='flex flex-col mt-4 ml-4 h-1/4 text-xl'>
              <p className='mb-4'>Epochs: {epochs}</p>
              <p className=''>Error: <span className='text-sm'>{error}</span></p>
            </div>
          </div>
          <div className='flex flex-col h-full text-sm break-all'>
            <div className='flex flex-col mt-4 ml-4 text-white h-1/5'>
              <p className='mb-2 uppercase text-teal-600'>Input File</p>
              <input 
                type="file" 
                className='h-full hover:cursor-pointer'
                onChange={event => onInputUpload(event.target.files)}/>
            </div>
            <div className='flex w-full h-1/6 items-center justify-center'>
              {!trainingState && 
                <button className='h-1/2 w-3/4  border-teal-500 border-2 rounded-xl uppercase hover:bg-teal-500 hover:text-gray-800'>Predict</button>
              }
              {trainingState && 
                <button className='h-1/2 w-3/4  border-teal-500 border-2 rounded-xl uppercase cursor-not-allowed' title='Cannot run during training'>Predict</button>
              }
            </div>
            {!trainingState &&
              <div className='flex flex-col h-1/2 w-full items-center justify-center'>
                <button className='h-1/5 w-5/6  border-teal-500 border-2 rounded-xl uppercase mb-8 hover:bg-teal-500 hover:text-gray-800'>Download Outputs</button>
                <button className='h-1/5 w-5/6  border-teal-500 border-2 rounded-xl uppercase hover:bg-teal-500 hover:text-gray-800'>Download Model Weights</button>
              </div>
            }
            {trainingState &&
              <div className='flex flex-col h-1/2 w-full items-center justify-center'>
                <button className='h-1/5 w-5/6  border-teal-500 border-2 rounded-xl uppercase mb-8 cursor-not-allowed' title="Cannot download during training">Download Outputs</button>
                <button className='h-1/5 w-5/6  border-teal-500 border-2 rounded-xl uppercase cursor-not-allowed' title='Cannot download during training'>Download Model Weights</button>
              </div>
            }
          </div>
        </div>
        
      </div>

    </div>  
  );
}