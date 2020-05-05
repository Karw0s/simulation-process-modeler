import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagramService } from '../../diagram/diagram.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  id: number;
  constructor(private diagramService: DiagramService,
              private router: Router) { }

  ngOnInit(): void {
  }

  goTo(destination: string) {
    const url: string = this.router.url;
    const re = new RegExp(`${destination}|home`, 'gi');
    if (url.match(re)) {
      if (destination.match('modeler')) {
        this.router.navigate(['/modeler/new']);
      } else {
        this.router.navigate(['/viewer']);
      }
    } else {
      this.router.navigate([`/${destination}`, this.diagramService.getLoadedDiagramId()]);
    }
  }
}
