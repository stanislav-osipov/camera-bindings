import { Injectable } from '@angular/core';
import { Tensor, tidy } from '@tensorflow/tfjs';
import { webcam } from '@tensorflow/tfjs-data';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private webcam;

  public async connect(element: HTMLVideoElement): Promise<void> {
    this.webcam = await webcam(element);
  }

  public async capture(): Promise<Tensor> {
    return await this.webcam.capture();
  }

  public async getImage(): Promise<Tensor> {
    const image = await this.capture();
    const result = tidy(() => image.expandDims(0).toFloat().div(127).sub(1));
    image.dispose();
    return result;
  }
}