import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import {ReturnCode} from '../public/codes';

const ErrorModal = ({open, onClose, error}) => {

    const [errorTitle, setErrorTitle] = useState();
    const [errorDescription, setErrorDescription] = useState();

    useEffect(() => {
        switch(error) {
            case ReturnCode.MissingJSON :
                setErrorTitle("Missing training data");
                setErrorDescription("Please upload training data for the model.");
                return;
            case ReturnCode.InvalidInputs :
                setErrorTitle("Input size error");
                setErrorDescription("Input layer size does not match uploaded training input size.");
                return;
            case ReturnCode.InvalidLayers :
                setErrorTitle("Layer error");
                setErrorDescription("An layer issue occurred.");
                return;
            case ReturnCode.InvalidOutputs :
                setErrorTitle("Output size error");
                setErrorDescription("Output layer size does not match uploaded training output size.");
                return;
            case ReturnCode.JSONFormatError :
                setErrorTitle("Training file format error");
                setErrorDescription("The uploaded training data file is not in the correct format.");
                return;
            case ReturnCode.InputFileFormatError :
                setErrorTitle("Input file format error");
                setErrorDescription("The uploaded input file is not in the correct format.");
                return;
            case ReturnCode.JSONPairSizeError :
                setErrorTitle("Training pair size error");
                setErrorDescription("Training data has pair size mismatch; one or more pairs are incorrect size.");
                return;
            case ReturnCode.JSONPairEntryError :
                setErrorTitle("Training pair entry error");
                setErrorDescription("Training data has pair entry issue; one or more pairs have invalid entries.");
                return;
            case ReturnCode.InvalidInputJSONFormat :
                setErrorTitle("Invalid input file JSON format");
                setErrorDescription("Input file JSON is not in the correct format.");
                return;
            case ReturnCode.InputFileEntrySizeError :
                setErrorTitle("Input file entry size mismatch");
                setErrorDescription("Input file has an entry size mismatch; one or more inputs are not the correct size.");
                return;
            case ReturnCode.InputFileNumberError :
                setErrorTitle("Input file entry data error");
                setErrorDescription("Input file has entry data issue; one or more entries has invalid values");
                return;
            default :
                setErrorTitle("Unknown error");
                setErrorDescription("An unknown error occurred. Please try again or report this issue on GitHub.");
                return;
        }
    });

    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex flex-col absolute left-0 right-0 top-0 bottom-0 m-auto w-1/3 h-1/4 text-white bg-gray-900 rounded-3xl border-2 border-teal-500 text-center items-center">
                <h1 className='mt-4 text-4xl h-1/4'>{errorTitle}</h1>
                <div className='flex flex-col h-1/2 w-5/6 items-center justify-center break-words mt-2'>
                    <h2 className='text-xl items-center w-full justify-center'>{errorDescription}</h2>
                </div>
            </div>
        </Modal>
    );
} 

export default ErrorModal;