import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss']
})
export class EmptyComponent implements OnInit {
@Input() emptyData:any;
  constructor() { }

  ngOnInit(): void {
  }

}
