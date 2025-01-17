import { RollbarService, RollbarErrorHandler, rollbarFactory } from 'app/rollbar';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AppComponent, SafeHtmlPipe, Nl2brPipe } from 'app/app.component';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { AppDataService } from 'app/services/app-data.service';
import { ProcessingArchitectureService } from 'app/services/processing-architecture.service';
import { HeaderComponent } from 'app/header/header.component';
import { AuthenticationComponent } from 'app/authentication/authentication.component';
import { CardsComponent } from 'app/cards/cards.component';
import { CardItemComponent } from 'app/cards/card-item/card-item.component';
import { EntryComponent } from 'app/entry/entry.component';
import { SectionsComponent } from 'app/entry/sections/sections.component';
import { SidStatusService } from 'app/services/sid-status.service';
import { AttachmentsComponent } from 'app/entry/attachments/attachments.component';
import { EntryContentComponent } from 'app/entry/entry-content/entry-content.component';
import { KnowledgeBaseComponent } from 'app/entry/knowledge-base/knowledge-base.component';
import { KnowledgeBaseItemComponent } from 'app/entry/knowledge-base/knowledge-base-item/knowledge-base-item.component';
import { AttachmentItemComponent } from 'app/entry/attachments/attachment-item/attachment-item.component';
import { CommentsComponent } from 'app/entry/entry-content/comments/comments.component';
import { CommentItemComponent } from 'app/entry/entry-content/comments/comment-item/comment-item.component';
import { EvaluationsComponent } from 'app/entry/entry-content/evaluations/evaluations.component';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { QuestionsComponent } from 'app/entry/entry-content/questions/questions.component';
import { RisksCartographyComponent } from 'app/entry/entry-content/risks-cartography/risks-cartography.component';
import { ActionPlanComponent } from 'app/entry/entry-content/action-plan/action-plan.component';
import { ActionPlanService } from 'app/entry/entry-content/action-plan/action-plan.service';
import { DPOPeopleOpinionsComponent } from 'app/entry/entry-content/dpo-people-opinions/dpo-people-opinions.component';
import { ValidatePIAComponent } from 'app/entry/entry-content/validate-pia/validate-pia.component';
import { RefusePIAComponent } from 'app/entry/entry-content/refuse-pia/refuse-pia.component';
import { PiaValidateHistoryComponent } from 'app/entry/entry-content/validate-pia/pia-validate-history/pia-validate-history.component';
import { SettingsComponent } from 'app/settings/settings.component';
import { HelpComponent } from 'app/help/help.component';
import { ModalsComponent } from 'app/modals/modals.component';
import { MeasuresComponent } from 'app/entry/entry-content/measures/measures.component';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { PaginationService } from 'app/entry/entry-content/pagination.service';
import { LanguagesService } from 'app/services/languages.service';
import { OverviewRisksComponent } from 'app/entry/entry-content/overview-risks/overview-risks.component';
import { ErrorsComponent } from 'app/errors/errors.component';
import {
    ActionPlanImplementationComponent
  } from 'app/entry/entry-content/action-plan/action-plan-implementation/action-plan-implementation.component';
import { environment } from '../environments/environment';
import { ListItemComponent } from 'app/lists/list-item/list-item.component';
import { SummaryComponent } from 'app/summary/summary.component';
import { AboutComponent } from 'app/about/about.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { SearchComponent } from 'app/search/search.component';
import { ResultItemComponent } from 'app/search/result/result-item.component';

import { ApiModule } from '@api/api.module';
import { SecurityModule } from '@security/security.module';
import { TemplatesComponent } from './templates/templates.component';
import { ToastrModule } from 'ngx-toastr';
import { AppErrorHandler } from 'app/services/app-error.handler';
import { FolderItemComponent } from './cards/folder-item/folder-item.component';
import { ListItemFolderComponent } from './lists/list-item-folder/list-item-folder.component';
import { PortfolioComponent, StructureItemComponent } from 'app/portfolio';
import { DashboardComponent, DashboardItemComponent } from 'app/dashboard';
import { DndModule } from 'ngx-drag-drop';
import { ProfileSession } from './services/profile-session.service';
import { PortfolioGuardService } from 'app/services/portfolio-guard.service';
import { StructureGuardService } from 'app/services/structure-guard.service';
import { ProcessingComponent } from './processing/processing.component';
import { ProcessingFormComponent} from './processing/processing-form/processing-form.component';
import { ProcessingService} from './processing/processing.service';
import { ProcessingDataTypesComponent } from './processing/processing-form/processing-data-types/processing-data-types.component';
import { PiasListComponent } from './pias/list/list.component';
import { PiasListItemComponent } from './pias/list/item/item.component';
import { ProcessingDataTypeService } from '@api/service';
import { EditableFieldComponent } from './pias/list/item/editable-field/editable-field.component';
import { ListsComponent } from './lists/lists.component';
import { StructureComponent } from './structure/structure.component';
import { CommentsComponent as ProcessingCommentsComponent } from './processing/comments/comments.component';
import { AttachmentsComponent as ProcessingAttachmentsComponent } from './processing/attachments/attachments.component';
import { AttachmentsService as ProcessingAttachmentsService} from './processing/attachments/attachments.service';
import { AttachmentItemComponent as ProcessingAttachmentItemComponent } from './processing/attachments/attachment-item/attachment-item.component';
import { EvaluationBlockComponent } from './processing/evaluation-block/evaluation-block.component';
import { ReportingComponent } from './reporting/reporting.component';
import { SearchService } from "./search/search.service";

const providersList: any = [
  AppDataService,
  ProcessingArchitectureService,
  ProfileSession,
  PortfolioGuardService,
  StructureGuardService,
  MeasureService,
  ModalsService,
  AttachmentsService,
  KnowledgeBaseService,
  ActionPlanService,
  PaginationService,
  SidStatusService,
  LanguagesService,
  GlobalEvaluationService,
  ProcessingService,
  ProcessingAttachmentsService,
  ProcessingDataTypeService,
  SearchService,
  {
    provide: ErrorHandler,
    useClass: AppErrorHandler,
  }
];

if (environment.rollbar_key.length > 0) {
  providersList.push(
    {
      provide: ErrorHandler,
      useClass: RollbarErrorHandler
    },
    {
      provide: RollbarService,
      useFactory: rollbarFactory
    }
  );
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AuthenticationComponent,
    CardsComponent,
    CardItemComponent,
    EntryComponent,
    SectionsComponent,
    AttachmentsComponent,
    EntryContentComponent,
    KnowledgeBaseComponent,
    KnowledgeBaseItemComponent,
    AttachmentItemComponent,
    CommentsComponent,
    CommentItemComponent,
    EvaluationsComponent,
    QuestionsComponent,
    RisksCartographyComponent,
    ActionPlanComponent,
    DPOPeopleOpinionsComponent,
    ValidatePIAComponent,
    RefusePIAComponent,
    PiaValidateHistoryComponent,
    SettingsComponent,
    HelpComponent,
    ModalsComponent,
    MeasuresComponent,
    OverviewRisksComponent,
    ErrorsComponent,
    ActionPlanImplementationComponent,
    ListItemComponent,
    SummaryComponent,
    SafeHtmlPipe,
    Nl2brPipe,
    AboutComponent,
    SearchComponent,
    ResultItemComponent,
    TemplatesComponent,
    FolderItemComponent,
    ListItemFolderComponent,
    PortfolioComponent,
    StructureItemComponent,
    DashboardComponent,
    DashboardItemComponent,
    ProcessingComponent,
    ProcessingFormComponent,
    ProcessingDataTypesComponent,
    PiasListComponent,
    PiasListItemComponent,
    EditableFieldComponent,
    ListsComponent,
    StructureComponent,
    ProcessingCommentsComponent,
    ProcessingAttachmentsComponent,
    ProcessingAttachmentItemComponent,
    EvaluationBlockComponent,
    ReportingComponent
  ],
  imports: [
    ChartsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TagInputModule,
    ApiModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SecurityModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      onActivateTick: true
    }),
    DndModule
  ],
  exports: [ChartsModule],
  providers: providersList,
  bootstrap: [AppComponent]
})
export class AppModule { }
