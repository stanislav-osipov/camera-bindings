import { Injectable } from '@angular/core';
import { Tensor, tidy, oneHot, tensor1d, keep } from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class DatasetService {
  public xs: Tensor;
  public ys: Tensor;
  public length = 0;

  public prepare(length: number): void {
    this.length = length;
    this.reset();
  }

  public reset(): void {
    this.xs?.dispose();
    this.ys?.dispose();
    this.xs = null;
    this.ys = null;
  }

  public add(example: Tensor, label: number): void {
    const y = tidy(() => oneHot(tensor1d([label]).toInt(), this.length));
  
    if (!this.xs) {
      this.xs = keep(example);
      this.ys = keep(y);
    } else {
      const oldX = this.xs;
      this.xs = keep(oldX.concat(example, 0));

      const oldY = this.ys;
      this.ys = keep(oldY.concat(y, 0));

      oldX.dispose();
      oldY.dispose();
      y.dispose();
    }
  }
}