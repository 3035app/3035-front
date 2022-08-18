import { Component, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { KnowledgeBaseService } from '../knowledge-base.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalEvaluationService } from '../../../services/global-evaluation.service';
import { PermissionsService } from '@security/permissions.service';

@Component({
  selector: 'app-knowledge-base-item',
  templateUrl: './knowledge-base-item.component.html',
  styleUrls: ['./knowledge-base-item.component.scss']
})
export class KnowledgeBaseItemComponent implements OnInit {

  @Input() item: any;
  @Input() itemKb: any;
  @Output() newMeasureEvent: EventEmitter<any> = new EventEmitter<any>();
  titleKb: string;
  hasEditPermission: boolean = false;

  constructor(private el: ElementRef, private router: Router,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _translateService: TranslateService,
              public _globalEvaluationService: GlobalEvaluationService,
    private activatedRoute: ActivatedRoute,
    private permissionsService: PermissionsService,) {
    this.router = router;
    this.permissionsService.hasPermission('CanEditProcessing').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.hasEditPermission = true;
      }
    });
  }

  ngOnInit() {
    this._translateService.get(this.itemKb.name).subscribe(value => {
        this.titleKb = value;
    });
  }

  /**
   * Shows or hides an help item.
   * @memberof KnowledgeBaseItemComponent
   */
  displayItem() {
    const accordeon = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-item-accordion button span');
    const displayer = this.el.nativeElement.querySelector('.pia-knowledgeBaseBlock-item-content');
    if (displayer.classList.contains('hide')) {
      displayer.classList.remove('hide');
      accordeon.classList.remove('fa-angle-down');
      accordeon.classList.add('fa-angle-up');
    } else {
      displayer.classList.add('hide');
      accordeon.classList.remove('fa-angle-up');
      accordeon.classList.add('fa-angle-down');
    }
  }

  /**
   * Adds a measure to the PIA.
   * This is used mainly on "Mesures préventives et existantes" subsection.
   * @memberof KnowledgeBaseItemComponent
   */
  addNewMeasure() {
    this.newMeasureEvent.emit(this.itemKb);
  }

}
