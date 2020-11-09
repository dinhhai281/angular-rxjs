import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, defer, fromEvent, of, Subject } from 'rxjs';
import { map, tap, switchMapTo, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

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
  @ViewChild('button', {static: true, read: ElementRef })
  button!: ElementRef<HTMLDivElement>;

  mouseDown$ = new Subject<MouseEvent>();
  buttonStyle$ = this.mouseDown$.pipe(
    switchMapTo(
      fromEvent<MouseEvent>(document, 'mousemove').pipe(
        takeUntil(fromEvent(document, 'mouseup').pipe(
          throttleTime(0, animationFrameScheduler),
          tap(_ => {
            this.button.nativeElement.style.transition = 'left 200ms';
            this.button.nativeElement.style.left = '5px'
          })
        )),
        withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
        map(([moveEvent, sliderWidth]) => {
          const position = moveEvent.clientX + 1 - 44;
          return { 'left.px': position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position) };
        })
      )
    )
  );
}
