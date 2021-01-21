import { Subject } from 'rxjs';

export class Bridge {
  public static readonly commands$ = new Subject();
}