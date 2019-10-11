import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { StructureModel } from '@api/models';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  @Input() structure: StructureModel;
  editor: any;
  elementId: string;

  @ViewChild('structureForm') structureForm: NgForm;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.structure = this.route.snapshot.data.structure;
  }
}
