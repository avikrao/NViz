export const ReturnCode = {
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
}

export const MessageCode = {
    StopTraining: 0,
    StartTraining: 1,
    FileUpload: 2,
    LayersSet: 3,
    ValuesUpdate: 4,
}