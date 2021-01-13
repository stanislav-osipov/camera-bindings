import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { MobilenetService } from './core/mobilenet.service';

@Component({
  selector: 'cb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public afAuth: AngularFireAuth,
    private mobilenet: MobilenetService,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();

    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  public ngOnInit(): void {
    this.mobilenet.init();
  }

  public login() {
    this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  public logout() {
    this.afAuth.signOut();
  }

  public ngOnDestroy() {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }
}
