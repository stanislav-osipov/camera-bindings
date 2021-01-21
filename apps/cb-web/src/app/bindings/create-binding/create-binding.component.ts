import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, NgForm, FormGroupDirective, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from, Subject } from 'rxjs';
import { distinctUntilChanged, filter, mergeMap, takeUntil, tap } from 'rxjs/operators';

import { OperationsService } from '../../core/operations.service';
import { CameraService } from '../../core/camera.service';
import { frames$ } from '../../core/engine.utils';
import { ElectronService } from '../../core/electron.service';
import { detect } from '../../core/detection.utils';
import { KeyboardComponent } from '../../keyboard/keyboard.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'cb-create-binding',
  templateUrl: './create-binding.component.html',
  styleUrls: ['./create-binding.component.scss']
})
export class CreateBindingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('webcam') webcam: ElementRef;
  @ViewChildren(KeyboardComponent) kb: QueryList<KeyboardComponent>;

  public matcher = new MyErrorStateMatcher();
  public creation = false;
  public trained = false;
  public kbSelecting: number;

  public actions = new FormArray([]);
  public continuous = new FormControl(false);
  public form = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
    webhook: new FormControl(null),
    description: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
    actions: this.actions,
    continuous: this.continuous,
  });

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private db: AngularFireDatabase,
    private matSnackBar: MatSnackBar,
    private operations: OperationsService,
    private camera: CameraService,
    private electron: ElectronService,
  ) {
    this.operations.predictions$.pipe(
      detect(),
      distinctUntilChanged(),
      tap(
        label => this.electron.ipc.send(
          'cbCommand',
          this.actions.at(Number(label)).value.value,
        ),
      ),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public ngAfterViewInit(): void {
    this.camera.connect(this.webcam.nativeElement).then(
      () => this.operations.warmup(),
    );

    frames$.pipe(
      filter(() => this.continuous.value),
      mergeMap(() => from(this.operations.predict())),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public onAddActionClick(event) {
    event.preventDefault();

    this.actions.push(new FormGroup({
      name: new FormControl(null),
      value: new FormControl(null),
    }));

    this.operations.prepareExamples(this.actions.length);
  }

  public onRemoveActionClick(event, index: number) {
    event.preventDefault();

    this.actions.removeAt(index);

    this.operations.prepareExamples(this.actions.length);
  }

  public onCancelClick(event) {
    event.preventDefault();

    this.router.navigate(['/bindings']);
  }

  public onCreateClick() {
    if (this.form.invalid) {
      return;
    }

    this.creation = true;

    this.db.list('bindings').push({
      name: this.form.value.name,
      description: this.form.value.description,
      webhook: this.form.value.webhook,
      actions: this.actions.value,
    })
    .then(() => {
      this.matSnackBar.open('Success!', null, {
        duration: 5000,
        panelClass: 'snack-success'
      });
      this.router.navigate(['/bindings']);
      this.creation = false;
    })
    .catch(error => {
      const msg = error && error.code === 'PERMISSION_DENIED' ?
        'Permission denied! Sign in or request permissions!' :
        'Something wen\'t wrong. Check your connection or try again later!';

      this.matSnackBar.open(msg, 'OK', {
        duration: 5000,
        panelClass: 'snack-error'
      });
      this.creation = false;
    });
  }

  public onTrainClick(event): void {
    event.preventDefault();
    this.kbSelecting = null;

    this.trained ?
      this.operations.predict() :
      this.operations.train(this.actions.length).then(
        () => this.trained = true,
      );
  }

  public captureExample(event, index: number): void {
    event.preventDefault();

    this.operations.addExample(index);
  }

  public initiateKeyCapture(event, index: number): void {
    event.preventDefault();

    this.kb.first.reset();
    this.kbSelecting = this.kbSelecting === index ? null : index;
    
    const key = this.actions.at(index).value.value;
    if (key) {
      this.kb.first.hightlight(key);
    }
  }

  public keySelected(key: string): void {
    const control = this.actions.at(this.kbSelecting) as FormGroup;
    control?.controls.value.setValue(key);
    this.kbSelecting = null;
  }

  public get kbVisible(): boolean {
    return this.kbSelecting !== undefined && this.kbSelecting !== null;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
