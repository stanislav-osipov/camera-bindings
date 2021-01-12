import { Component } from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import { FormControl, NgForm, FormGroupDirective, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export class CreateBindingComponent {
  public matcher = new MyErrorStateMatcher();
  public creation = false;

  public actions = new FormArray([]);
  public form = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
    webhook: new FormControl(null),
    description: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
    actions: this.actions,
  });

  constructor(
    private router: Router,
    private db: AngularFireDatabase,
    private matSnackBar: MatSnackBar,
  ) {}

  public onAddActionClick(event) {
    event.preventDefault();

    this.actions.push(new FormGroup({
      action: new FormControl(null),
    }));
  }

  public onRemoveActionClick(event, index: number) {
    event.preventDefault();

    this.actions.removeAt(index);
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
}