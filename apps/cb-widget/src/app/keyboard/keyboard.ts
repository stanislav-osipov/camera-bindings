import { ipcMain } from 'electron';
import { keyTap } from 'robotjs';
import { KeyboadMap } from './keyboard.map';

const KB_COMMAND_REGEXP = /\{([^)]+)\}/;

export class Keyboard {
  public static init(): void {
    ipcMain.on('cbCommand', (_, command) => {   
      this.onCommand(command)
    });
  }

  private static onCommand(command:  string): void {
    if (!command) {
      return;
    }

    const keyCommand = KB_COMMAND_REGEXP.exec(command)?.[1];

    if (!keyCommand) {
      return;
    }

    const key = KeyboadMap.get(keyCommand) || keyCommand;
    console.log('Tapped:', key);
    keyTap(key);
  }
}
