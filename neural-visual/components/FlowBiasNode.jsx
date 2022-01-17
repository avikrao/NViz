import ReactFlow, { Handle } from "react-flow-renderer";
import Link from "next/link";

const FlowBiasNode = ({ id }) => {

    return (
        <Link href="/about#bias">
            <div className="flex flex-col w-12 h-12 bg-gray-800 border-yellow-400 border-2 rounded-3xl items-center justify-center cursor-pointer nodrag">
                <p className="text-white text-center items-center justify-center">{id}</p>
                <Handle type="source" position="right" id="a"/>
            </div>
        </Link>
    );
}

export default FlowBiasNode;