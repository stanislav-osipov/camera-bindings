export const MOBILENET_PATH = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
export const MOBILENET_OUTPUT_LAYER = 'conv_pw_13_relu';

export const LEARNING_RATE = 0.0001;
export const LOSS_FUNCTION = 'categoricalCrossentropy';
export const BATCH_SIZE_FRACTION = 0.4;
export const TRAIN_EPOCHS = 20;

export const MODEL_FIRST_LAYER: any = Object.freeze({
  units: 100,
  activation: 'relu',
  kernelInitializer: 'varianceScaling',
  useBias: true
});

export const MODEL_LAST_LAYER: any = Object.freeze({
  kernelInitializer: 'varianceScaling',
  useBias: false,
  activation: 'softmax'
});
