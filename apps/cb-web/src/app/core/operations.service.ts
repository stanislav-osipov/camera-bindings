import { Injectable } from '@angular/core';
import { Tensor, nextFrame } from '@tensorflow/tfjs';
import { Subject } from 'rxjs';
import { CameraService } from './camera.service';
import { DatasetService } from './dataset.service';
import { ModelService } from './model.service';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  public predictions$ = new Subject<number>();

  constructor(
    private modelService: ModelService,
    private camera: CameraService,
    private dataset: DatasetService,
  ) {}

  public async warmup(): Promise<void> {
    await this.modelService.ready$.toPromise();
    const image = await this.camera.capture();
    this.modelService.base.predict(image.expandDims(0));
    image.dispose();
  }

  public async predict(): Promise<void> {
    const image = await this.camera.getImage();
    const embeddings = this.modelService.base.predict(image);    
    const predictions = this.modelService.model.predict(embeddings) as Tensor;
  
    const predictedLabel = predictions.as1D().argMax();
    const labelId = (await predictedLabel.data())[0];
    image.dispose();
    
    this.predictions$.next(labelId);
    await nextFrame();
  }

  public async addExample(label: number): Promise<void> {
    const image = await this.camera.getImage();
    this.dataset.add(this.modelService.base.predict(image) as Tensor, label);
    image.dispose();
  }

  public async train(labelsLength: number): Promise<void> {
    return this.modelService.train(labelsLength);
  }

  public prepareExamples(labelsLength: number): void {
    this.dataset.prepare(labelsLength);
  }
}
