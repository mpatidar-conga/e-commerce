import { Component, OnInit, Input, ElementRef, HostBinding } from '@angular/core';
/**
 * Detail section component is used to display a section of the detail pages.
 * @ignore
 */
@Component({
  selector: 'app-detail-section',
  templateUrl: './detail-section.component.html',
  styleUrls: ['./detail-section.component.scss']
})
export class DetailSectionComponent implements OnInit {
  /**
   * The title for this section of the detail page.
   */
  @Input() title: string;

  public active: boolean = false;

  constructor(public element: ElementRef) {
    element.nativeElement.classList.add('animated');
    element.nativeElement.classList.add('fadeIn');
  }

  ngOnInit() { }

}
