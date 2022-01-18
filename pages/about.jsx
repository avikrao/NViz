import Head from "next/head";
import Link from "next/link";
import prefix from "../utils/prefix";

export default function About() {
    return (
        <div className='site flex flex-col h-full w-full bg-gray-900 font-vietnam'>
            <Head>
                <link rel='shortcut icon' href={`${prefix}/images/favicon.ico`}/>
                <title>NViz | About</title>
            </Head>
            <div className='flex flex-row w-full bg-gray-900 h-20 items-center border-b-2 border-teal-900'>
                <div className='ml-6 mr-6'>
                    <Link href="/">
                        <a className='flex flex-row text-white text-2xl items-center hover:text-white'><img src={`${prefix}/images/favicon.ico`} className='h-10 mr-4'></img>NViz</a>
                    </Link>
                </div>
                <div className='items-center w-1/3'>
                    <Link href="/about">
                        <a className='text-white text-base hover:text-teal-400 hover:cursor-pointer mr-4'>
                        About
                        </a>
                    </Link>
                    <Link href="/format">
                        <a className='text-white text-base hover:text-teal-400 hover:cursor-pointer'>
                        File Format
                        </a>
                    </Link>
                </div>
                <div className='flex flex-row ml-auto w-1/4 h-full items-center justify-end'>
                    <div className='flex flex-row w-1/2 h-1/3 justify-end mr-4'>
                        <a className='flex flex-row justify-end' target="_blank" href='https://github.com/AvikRao/NViz'>
                            <p className='flex text-center items-center justify-center mr-4 text-gray-500 cursor-default'>Made by Avik Rao</p>
                            <img className='h-full cursor-pointer'
                                src={`${prefix}/images/github.svg`}
                                onMouseOver={event => event.target.src = `${prefix}/images/github-color.svg`}
                                onMouseOut={event => event.target.src = `${prefix}/images/github.svg`}
                            />
                        </a>
                    </div>
                </div>
            </div>

            <div className='flex w-full h-full'>
                <div className='flex flex-col mt-24 text-white justify-center text-center items-center'>
                    <h1 className='text-4xl underline mb-4'>About NViz</h1>
                    <div className='w-1/2 h-1/2'>
                        <img src={`${prefix}/images/network.png`}></img>
                    </div>
                    <div className='w-3/5 h-full mb-12'>
                        <div id="about" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>What is NViz?</h2>
                            <p className='text-lg'>NViz is an online visualization platform for both the structure and training of <a href="https://en.wikipedia.org/wiki/Multilayer_perceptron" target="_blank">multiplayer perceptron</a> (MLP) <a href="https://en.wikipedia.org/wiki/Feedforward_neural_network" target="_blank">feed-forward neural networks.</a></p>
                        </div>
                        <div id="use" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>What can I use it for?</h2>
                            <p className='text-lg'>You can use NViz for training, visualizing, and experimenting with a variety of different feed-forward neural network architectures on your own training datasets. 
                            Simply provide a dataset in the <Link href="/format"><a target="_blank">correct format</a></Link>, adjust the settings as you see fit, and press train to see your neural network in action! 
                            You can provide an input file to test your model's predictions, or you can download the model's weights for your own use.</p>
                        </div>
                        <div id="made" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>What is it made with?</h2>
                            <p className='text-lg'>NViz is made with <Link href="https://nextjs.org/"><a target="_blank">Next.js</a></Link> and <a href="https://reactjs.org/" target="_blank">React</a> with <a href="https://tailwindcss.com/" target="_blank">Tailwind</a> for styling. 
                            It uses <a href="https://www.cplusplus.com/" target="_blank">C++</a> and <a href="https://webassembly.org/" target="_blank">WebAssembly</a> to train your model from directly within your browser at lightning-fast speeds!</p>
                        </div>
                        <div id="open-source" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>Is it open source?</h2>
                            <p className='text-lg'>Absolutely! NViz is entirely open-source and available on <a href="https://github.com/AvikRao/NViz">GitHub. </a>
                            If you enjoy NViz and find it helpful, consider leaving a star on the repository! If not, please feel free to file an issue and describe how you feel it could be improved. </p>
                        </div>
                        <div id="datasets" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>I'd like to try NViz, but I don't have a dataset...</h2>
                            <p className='text-lg'>NViz was created to help people develop a better understanding of the structure and training of neural networks on their own datasets, but if 
                            you just want to experiment with the site and explore its capabilities, that's perfectly fine! A number of feasible datasets are readily available on the <a href="https://github.com/AvikRao/NViz/tree/master/datasets" target="_blank">GitHub repository</a> for you to use.
                            If you would like to train on your own dataset, follow the <Link href="/format"><a target="_blank">format guide</a></Link> for structuring your data files.</p>
                        </div>
                        <div id="limits" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>What are its limitations?</h2>
                            <p className='text-lg'>As mentioned, NViz can visualize and train multilayer perceptron feed-forward neural networks. 
                            While fairly general, these aren't as robust or versatile as other, more complex models such as <a href="https://en.wikipedia.org/wiki/Recurrent_neural_network" target="_blank">recurrent neural networks</a> (RNNs).
                            NViz also allows a maximum of 1000 nodes in any individual layer to ease the load on your browser.
                            Additionally, all models trained on NViz make use of the <a href="https://en.wikipedia.org/wiki/Logistic_function" target="_blank">Sigmoid</a> <a href="https://en.wikipedia.org/wiki/Activation_function" target="_blank">activation function</a> at hidden layers. 
                            Other activation functions such as ReLU and tanh may be better suited depending on the purpose of the neural network.
                            In the future, NViz will support the selection of different activation functions based on model purpose. </p>
                        </div>
                    </div>
                    <div className='w-3/5 h-full'>
                        <h1 className='text-4xl underline mb-8'>Technical Information</h1>
                        <div id="bias" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>What is the extra <span className="text-yellow-300">yellow</span> node in the input layer?</h2>
                            <p className='text-lg'>The extra node in the input layer is called a <a href="https://www.pico.net/kb/the-role-of-bias-in-neural-networks/" target="_blank">bias</a>. 
                            Consider it an extra, constant input that acts like a battery providing continuous power to your network.</p>
                        </div>
                        <div id="speed" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>What is training speed?</h2>
                            <p className='text-lg'>While JavaScript's event loop is considered non-blocking, it can in fact be blocked by tasks such as infinite while-loops, which is essentially what happens when you press "Train". 
                            To prevent event-loop blocking during this loop, after each training batch there is a 4 millisecond yield during which the event loop can process tasks such as handling a click on the "Stop training" button. 
                            The "training speed" setting is, effectively, the number of training pairs that are processed during each batch before the loop yields. The higher the "training speed", the more training pairs are processed 
                            during each batch. However, somewhat counterintuitively, a lower "training speed" setting may sometimes actually result in faster training, due to the nature of resource and load management. 
                            Setting the training speed too high may bottleneck the loop and result in actually slower training or even an unresponsive UI. Adjust training speed before and during training for best results.
                            </p>
                        </div>
                        <div id="inaccurate" className='mb-8'>
                            <h2 className='text-2xl text-teal-500'>I'm not getting the results I want...</h2>
                            <p className='text-lg'>Neural network model accuracy is highly dependant on features such as network architecture, training rate, and the quality and quantity of its training dataset. Use NViz as a platform to experiment with different architectures and settings!
                            Perhaps refine your training dataset or reduce its size to prevent redundancy and increase the rate of training (effectively raising <a href="https://deepai.org/machine-learning-glossary-and-terms/epoch" target="_blank">epochs</a>/second). 
                            If no amount of experimentation is working, it might be the case that a simple MLP feed-forward network simply does not have the capacity to solve your problem, 
                            or an online platform may not be performant enough to quickly train on your dataset. Consider programming your own model from scratch using popular libraries like <a href="https://pytorch.org/" target="_blank">Pytorch</a> or <a href="https://www.tensorflow.org/" target="_blank">Tensorflow.</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}