import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, combineLatest, concat, defer, fromEvent, interval, merge, of, race, scheduled, Subject } from 'rxjs';
import { concatAll, map, mapTo, switchMap, switchMapTo, take, takeUntil,  takeWhile,  tap,  throttleTime, withLatestFrom, } from 'rxjs/operators';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  @ViewChild('slider', { static: true, read: ElementRef })
  slider!: ElementRef<HTMLDivElement>;
  @ViewChild('button', { static: true, read: ElementRef })
  button!: ElementRef<HTMLDivElement>;
  mouseDown$ = new Subject<MouseEvent>();
  mouseUp$ = new Subject<MouseEvent>();


  dragStream$ = this.mouseDown$.pipe(
    switchMapTo(
      fromEvent<MouseEvent>(document, 'mousemove').pipe(
        takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
        throttleTime(0, animationFrameScheduler),
        withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
        map(([moveEvent, sliderWidth]) => {
          const position = moveEvent.clientX + 1 - 44;
          return { 'left.px': position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position) };
        }),
      ),
    ),
  )

  dropStream$ = this.dragStream$.pipe(
    switchMapTo(
      fromEvent<MouseEvent>(document, 'mouseup').pipe(
       
       switchMapTo(
        interval(3).pipe(

         
          throttleTime(0, animationFrameScheduler),
          withLatestFrom(defer(() => of(parseInt(this.button.nativeElement.style.left)))),
          takeWhile(([i, pos]) => {
            return i < pos;
          }),
          map(([i, pos]) => {
          
            const position = pos - (i)/pos * pos
            return { 'left.px': position};
          }),
        )
        
      ),
    ),
  ))

  buttonStyle$ = merge(this.dropStream$, this.dragStream$)

  

}
