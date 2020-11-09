import { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, defer, fromEvent, of, Subject } from 'rxjs';
import { map, switchMap, switchMapTo, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements OnInit {
  ngOnInit(): void {
    this.activeSlider();
  }
  @ViewChild('slider') slider!: ElementRef<HTMLDivElement>;
  @ViewChild('button') button!: ElementRef<HTMLDivElement>;
  mouseDownObs = fromEvent(document.getElementsByClassName("slider"), 'mousedown');
  mouseMoveObs = fromEvent(document, 'mousemove');
  mouseUpObs = fromEvent(document, 'mouseup');

  //-------------------------------------------------------------------------------
  activeSlider = () => {
    this.mouseDownObs.pipe(
      tap(_ => this.handleButtonClick()),
      switchMap(_ => this.mouseMoveObs.pipe(
        takeUntil(this.mouseUpObs.pipe(
          throttleTime(0, animationFrameScheduler),
          tap(_ => this.handleButtonRealease())
        )),
      )),
      tap(event => this.handleMoveButtonToNewPosition(event)),
    ).subscribe();
  }

  handleButtonClick = () => {
    this.button.nativeElement.style.transition = '100ms';
  }
  handleButtonRealease = () => {
    this.button.nativeElement.style.transition = 'left 500ms';
    this.button.nativeElement.style.left = '1px'
  }
  handleMoveButtonToNewPosition = (event) => {
    const sliderWidth = this.slider.nativeElement.clientWidth;
    const position = event.clientX + 1 - 44;

    this.button.nativeElement.style.left = (position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position)) + 'px';
  }
}