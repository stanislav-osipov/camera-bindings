import { Injectable } from '@angular/core';
import { LayersModel, sequential, layers, train } from '@tensorflow/tfjs';
import { ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { BATCH_SIZE_FRACTION, LEARNING_RATE, LOSS_FUNCTION, MODEL_FIRST_LAYER, MODEL_LAST_LAYER, TRAIN_EPOCHS } from './constants';
import { DatasetService } from './dataset.service';
import { MobilenetService } from './mobilenet.service';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  public model: LayersModel;
  public base: LayersModel;
  public ready$ = new ReplaySubject<void>(1);

  constructor(
    private mobilenet: MobilenetService,
    private dataset: DatasetService
  ) {
    mobilenet.ready$.pipe(take(1)).subscribe(() => {
      this.base = mobilenet.model;
      this.ready$.next();
    });
  }

  public async train(labelsLength: number): Promise<void> {
    this.model = sequential({
      layers: [
        layers.flatten({inputShape: this.mobilenet.model.outputs[0].shape.slice(1)}),
        layers.dense(MODEL_FIRST_LAYER),
        layers.dense({
          units: labelsLength,
          ...MODEL_LAST_LAYER,
        })
      ]
    });
  
    const optimizer = train.adam(LEARNING_RATE);
    this.model.compile({ optimizer: optimizer, loss: LOSS_FUNCTION });
  
    const batchSize = Math.floor(this.dataset.xs.shape[0] * BATCH_SIZE_FRACTION);

    await this.model.fit(this.dataset.xs, this.dataset.ys, {
      batchSize,
      epochs: TRAIN_EPOCHS,
    });
  }
}
