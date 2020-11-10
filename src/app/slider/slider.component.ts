import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, defer, fromEvent, interval, merge, of, Subject } from 'rxjs';
import { map, scan, switchMap, switchMapTo, take, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

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

  mouseDown$ = new Subject<MouseEvent>();
  buttonStyle$ = this.mouseDown$.pipe(
    switchMapTo(
      merge(
        fromEvent<MouseEvent>(document, 'mousemove').pipe(
          takeUntil(fromEvent(document, 'mouseup')),
          throttleTime(0, animationFrameScheduler),
          withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
          map(([moveEvent, sliderWidth]) => {
            const position = moveEvent.clientX + 1 - 44;
            return { 'left.px': position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position) };
          }),
        ),
        fromEvent<MouseEvent>(document, 'mouseup').pipe(
          map(mouseupEvent => mouseupEvent.clientX + 1 - 44),
          withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
          switchMap(([position, sliderWidth]) => {
            const step = sliderWidth / 60;
            return interval(0, animationFrameScheduler).pipe(
              take(position / step + 1),
              scan(acc => acc - step, Math.min(sliderWidth - 1 - 44, position)),
              map(position => ({ 'left.px': position <= 1 ? 1 : position })),
            );
          }),
        ),
      ),
    ),
  );
}
