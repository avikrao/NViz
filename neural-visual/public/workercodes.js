const ReturnCode = {
    ModuleReady: 0,
    JSONFormatError: 1,
    JSONPairSizeError: 2,
    JSONPairEntryError: 3,
    JSONSuccess: 4, 
    MissingJSON: 5,
    InvalidLayers: 6,
    InvalidInputs: 7,
    InvalidOutputs: 8,
    StartSuccess: 9,
    StoppedTraining: 10,
    TrainingUpdate: 11,
    InputFileFormatError: 12,
    InvalidInputJSONFormat: 13,
    InputFileEntrySizeError: 14,
    InputFileNumberError: 15,
    InputUploadSuccess: 16,
}

const MessageCode = {
    StopTraining: 0,
    StartTraining: 1,
    TrainingUpload: 2,
    LayersSet: 3,
    ValuesUpdate: 4,
    InputUpload: 5,
}