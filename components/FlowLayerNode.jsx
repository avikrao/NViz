import ReactFlow, { Handle } from "react-flow-renderer";

const FlowLayerNode = ({ id }) => {
    return (
        <div className="flex flex-col w-12 h-12 bg-gray-800 border-blue-700 border-2 rounded-3xl items-center justify-center cursor-default  nodrag " onClick={() => console.log("hello!")}>
            <Handle type="target" position="left" id="targetHandle"/>
            <p className="text-white text-center items-center justify-center">{id}</p>
            <Handle type="source" position="right"/>
        </div>
    );
}

export default FlowLayerNode;