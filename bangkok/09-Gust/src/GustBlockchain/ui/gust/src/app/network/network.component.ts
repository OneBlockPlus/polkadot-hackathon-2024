import { AfterViewInit, Component } from '@angular/core';

declare const mermaid: any;

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css'],
})
export class NetworkComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    mermaid.initialize({ startOnLoad: true });
    mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  }
}
