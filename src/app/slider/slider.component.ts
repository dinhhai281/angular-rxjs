import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, defer, fromEvent, of, Subject } from 'rxjs';
import { map, switchMapTo, takeUntil, throttleTime, withLatestFrom, tap } from 'rxjs/operators';

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

  @ViewChild('circle', { static: true, read: ElementRef })
  circle!: ElementRef<HTMLDivElement>;

  mouseDown$ = new Subject<MouseEvent>();
  buttonStyle$ = this.mouseDown$.pipe(
    switchMapTo(
      fromEvent<MouseEvent>(document, 'mousemove').pipe(
        takeUntil(
          fromEvent(document, 'mouseup').pipe(
            throttleTime(0, animationFrameScheduler),
            tap(() => {
              this.circle.nativeElement.style.transition = 'left 1s';
              this.circle.nativeElement.style.left = '1px';
            })
          )
        ),
        throttleTime(0, animationFrameScheduler),
        withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
        map(([moveEvent, sliderWidth]) => {
          const position = moveEvent.clientX + 1 - 44;
          return { 'left.px': position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position) };
        })
      )
    )
  );
}
