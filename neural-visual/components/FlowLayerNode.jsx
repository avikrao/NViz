import ReactFlow, { Handle } from "react-flow-renderer";

const FlowLayerNode = ({ id }) => {
    return (
        <div className="flex flex-col w-16 h-16 bg-gray-800 border-red-600 border-2 rounded-3xl items-center justify-center cursor-default  nodrag " onClick={() => console.log("hello!")}>
            <Handle type="target" position="left"/>
            <p className="text-white text-center items-center justify-center">{id}</p>
            <Handle type="source" position="right" isValidConnection={false}/>
        </div>
    );
}

export default FlowLayerNode;