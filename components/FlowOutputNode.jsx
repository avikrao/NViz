import ReactFlow, { Handle } from "react-flow-renderer";

const FlowOutputNode = ({ id }) => {
    return (
        <div className="flex flex-col w-12 h-12 bg-gray-800 border-green-400 border-2 rounded-3xl items-center justify-center cursor-default  nodrag " onClick={() => console.log("hello!")}>
            <Handle type="target" position="left"/>
            <p className="text-white text-center items-center justify-center">{id}</p>
        </div>
    );
}

export default FlowOutputNode;