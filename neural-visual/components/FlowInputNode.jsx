import ReactFlow, { Handle } from "react-flow-renderer";

const FlowInputNode = ({ id }) => {


    return (
        <div className="flex flex-col w-16 h-16 bg-gray-800 border-blue-700 border-2 rounded-3xl items-center justify-center cursor-default  nodrag " onClick={() => console.log("hello!")}>
            <p className="text-white text-center items-center justify-center">{id}</p>
            <Handle type="source" position="right" id="a" isConnectable="false" isValidConnection={false}/>
        </div>
    );
}

export default FlowInputNode;