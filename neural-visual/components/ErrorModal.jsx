import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import {ReturnCode} from '../public/codes';

const ErrorModal = ({open, onClose, error}) => {

    const [errorTitle, setErrorTitle] = useState();
    const [errorDescription, setErrorDescription] = useState();

    useEffect(() => {
        // switch (error) {

        // }
        console.log(error);
    }, []);

    return (
        <Modal open={open} onClose={onClose}>
            <div className="absolute left-0 right-0 top-0 bottom-0 m-auto w-1/4 h-1/4 text-white bg-gray-900 rounded-3xl border-2 border-teal-500 text-center">
                <h1 className='mt-4 text-4xl'>{error}</h1>
            </div>
        </Modal>
    );
} 

export default ErrorModal;