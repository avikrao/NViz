import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, { Background } from 'react-flow-renderer';
import LayerList from '../components/LayerList';

export default function Index() {

  const [learningRate, setLearningRate] = useState(100000)

  const worker = useRef();

  useEffect(() => {
    worker.current = new Worker("worker.js");
  }, []);

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
          <input type="file" className='ml-6 my-2 h-full text-white hover:cursor-pointer'></input>
        </div>
        <div className="w-1/2 flex flex-col">
          <p className='flex uppercase text-teal-600 text-sm mt-2'>Layers</p>
          <div className='flex flex-row h-1/2 mt-1'>
            <LayerList className="flex flex-row" inputs={3} outputs={1}></LayerList>
          </div>
        </div>
        <div className='flex w-1/6 h-full justify-center'>
          <div className='flex flex-col h-full justify-center'>
            <label className='uppercase text-teal-600 text-sm mb-2'>Learning Rate</label>
            <input type="range" className="range range-accent mb-2" max={100000} min={1} onChange={event => setLearningRate(event.target.value)}></input>

            <label className='uppercase text-teal-600 text-sm mb-2'>Training Speed</label>
            <input type="range" className="range range-accent" max={100000} min={1} onChange={event => setLearningRate(event.target.value)}></input>
          </div>
        </div>
      </div>

      <div className="h-full">
        <ReactFlow className="bg-gray-900">
          <Background color="#fff"/>
        </ReactFlow>
      </div>

    </div>  
  );
}