import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

declare let electron: any;

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  public get ipc(): IpcRenderer {
    return electron?.ipc;
  }

  public get isWidget(): boolean {
    return !!electron?.platform;
  }
}
