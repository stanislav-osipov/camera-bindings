import { Injectable } from '@angular/core';
import { loadLayersModel, LayersModel, model } from '@tensorflow/tfjs';
import { ReplaySubject } from 'rxjs';
import { MOBILENET_OUTPUT_LAYER, MOBILENET_PATH } from './constants';

@Injectable({
  providedIn: 'root'
})
export class MobilenetService {
  public ready$ = new ReplaySubject<void>(1);
  public model: LayersModel;

  public async init(): Promise<void> {
    this.model = await this.load();
    this.ready$.next();
  }

  private async load(): Promise<LayersModel> {
    const mobilenet = await loadLayersModel(MOBILENET_PATH);
    const layer = mobilenet.getLayer(MOBILENET_OUTPUT_LAYER);

    return model({inputs: mobilenet.inputs, outputs: layer.output});
  }
}
