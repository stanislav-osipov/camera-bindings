import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map } from 'rxjs/operators';

@Component({
  selector: 'cb-bindings',
  templateUrl: './bindings.component.html',
  styleUrls: ['./bindings.component.scss']
})
export class BindingsComponent {
  private isDeleteInProgress = false;
  public bindings$;

  constructor(
    private db: AngularFireDatabase,
  ) {
    this.bindings$ = this.db.list('bindings').snapshotChanges().pipe(
      map(snapshots => snapshots.map(snapshot => ({
        key: snapshot.key,
        value: snapshot.payload.val()
      })))
    );
  }

  public delete(key: string) {
    if (this.isDeleteInProgress) {
      return;
    }

    this.isDeleteInProgress = true;
    this.db.list(`bindings/${key}`).remove().then(() => this.isDeleteInProgress = false);
  }
}
