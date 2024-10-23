import { Component , OnInit} from '@angular/core';
import { DevDocsService } from '../services/dev-docs.service';
import { marked } from 'marked';


@Component({
  selector: 'app-docs-display',
  templateUrl: './docs-display.component.html',
  styleUrls: ['./docs-display.component.css']
})
export class DocsDisplayComponent implements OnInit{
  docsContent: string = '';

  constructor(private devDocsService: DevDocsService) {}

  ngOnInit(): void {
    this.loadDevDocs();
  }

  loadDevDocs(): void {
    this.devDocsService.fetchReadme().subscribe((data) => {
      const markedContent = marked(data);

      if (markedContent instanceof Promise) {
        markedContent.then((resolvedContent) => {
          this.docsContent = resolvedContent;
        });
      } else {
        this.docsContent = markedContent;
      }
    });
  }
}
