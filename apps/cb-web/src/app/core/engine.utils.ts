import { Observable, of } from 'rxjs';
import { expand, filter, map, share } from 'rxjs/operators';

export interface IFrameData {
  frameStartTime: number;
  deltaTime: number;
}

const TARGET_RATE = 1 / 30;

const step: (prevFrame: IFrameData) => Observable<IFrameData> = 
  (prevFrame: IFrameData) => new Observable<IFrameData>(observer => {
    requestAnimationFrame(frameStartTime => {
      observer.next({
        frameStartTime,
        deltaTime: prevFrame ? (frameStartTime - prevFrame.frameStartTime) / 1000 : 0
      });
    })
  }).pipe(
    map(frame => ({
      ...frame,
      deltaTime: frame.deltaTime > TARGET_RATE ? TARGET_RATE : frame.deltaTime,
    }))
  );

export const frames$ = of(null)
  .pipe(
    expand(frame => step(frame)),
    filter(frame => !!frame),
    map(frame => frame.deltaTime),
    share()
  );