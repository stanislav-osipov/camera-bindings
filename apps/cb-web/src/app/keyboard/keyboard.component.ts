import { AfterViewInit, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import Keyboard from 'simple-keyboard';

@Component({
  selector: 'cb-keyboard',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss'],
})
export class KeyboardComponent implements AfterViewInit {
  @Output() key = new EventEmitter();

  private value = '';
  private commonKeyboardOptions = {
    onChange: (input: string) => this.onChange(input),
    onKeyPress: (button: string) => this.onKeyPress(button),
    theme: 'simple-keyboard hg-theme-default hg-layout-default',
    physicalKeyboardHighlight: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    debug: false,
  };
  private keyboard: Keyboard;
  private keyboardControlPad: Keyboard;
  private keyboardArrows: Keyboard;
  private keyboardNumPad: Keyboard;
  private keyboardNumPadEnd: Keyboard;

  private hightlighted: string;

  public ngAfterViewInit(): void {
    this.keyboard = new Keyboard('.simple-keyboard-main', {
      ...this.commonKeyboardOptions,
      layout: {
        default: [
          '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
          '` 1 2 3 4 5 6 7 8 9 0 - = {backspace}',
          '{tab} q w e r t y u i o p [ ] \\',
          '{capslock} a s d f g h j k l ; " {enter}',
          '{shiftleft} z x c v b n m , . / {shiftright}',
          '{controlleft} {altleft} {metaleft} {space} {metaright} {altright}'
        ],
        shift: [
          '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
          '~ ! @ # $ % ^ & * ( ) _ + {backspace}',
          '{tab} Q W E R T Y U I O P { } |',
          '{capslock} A S D F G H J K L : " {enter}',
          '{shiftleft} Z X C V B N M < > ? {shiftright}',
          '{controlleft} {altleft} {metaleft} {space} {metaright} {altright}'
        ]
      },
      display: {
        '{escape}': 'esc ⎋',
        '{tab}': 'tab ⇥',
        '{backspace}': 'backspace ⌫',
        '{enter}': 'enter ↵',
        '{capslock}': 'caps lock ⇪',
        '{shiftleft}': 'shift ⇧',
        '{shiftright}': 'shift ⇧',
        '{controlleft}': 'ctrl ⌃',
        '{controlright}': 'ctrl ⌃',
        '{altleft}': 'alt ⌥',
        '{altright}': 'alt ⌥',
        '{metaleft}': 'cmd ⌘',
        '{metaright}': 'cmd ⌘'
      }
    });

    this.keyboardControlPad = new Keyboard('.simple-keyboard-control', {
      ...this.commonKeyboardOptions,
      layout: {
        default: [
          '{prtscr} {scrolllock} {pause}',
          '{insert} {home} {pageup}',
          '{delete} {end} {pagedown}'
        ]
      }
    });

    this.keyboardArrows = new Keyboard('.simple-keyboard-arrows', {
      ...this.commonKeyboardOptions,
      layout: {
        default: ['{arrowup}', '{arrowleft} {arrowdown} {arrowright}']
      }
    });

    this.keyboardNumPad = new Keyboard('.simple-keyboard-numpad', {
      ...this.commonKeyboardOptions,
      layout: {
        default: [
          '{numlock} {numpaddivide} {numpadmultiply}',
          '{numpad7} {numpad8} {numpad9}',
          '{numpad4} {numpad5} {numpad6}',
          '{numpad1} {numpad2} {numpad3}',
          '{numpad0} {numpaddecimal}'
        ]
      }
    });

    this.keyboardNumPadEnd = new Keyboard('.simple-keyboard-numpadEnd', {
      ...this.commonKeyboardOptions,
      layout: {
        default: ['{numpadsubtract}', '{numpadadd}', '{numpadenter}']
      }
    });
  }

  public hightlight(key: string): void {
    this.keyboard.addButtonTheme(key, 'hg-selectedButton');
    this.hightlighted = this.hightlighted ? `${this.hightlighted} ${key}` : key;
  }

  public reset(): void {
    this.keyboard.removeButtonTheme(this.hightlighted, 'hg-selectedButton');
    this.hightlighted = null;
  }

  private onChange(input: string): void {
    this.value = input;
  }

  private onKeyPress(button: string): void {
    if (
      button === '{shift}' ||
      button === '{shiftleft}' ||
      button === '{shiftright}' ||
      button === '{capslock}'
    ) {
      this.handleShift();
    }

    this.key.emit(button);
  }

  private handleShift(): void {
    const currentLayout = this.keyboard.options.layoutName;
    const shiftToggle = currentLayout === 'default' ? 'shift' : 'default';

    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  }
}
