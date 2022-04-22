import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ProcessingModel, ProcessingCommentModel } from '@api/models';
import { ProcessingCommentApi } from '@api/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-processing-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  @Input() processing: ProcessingModel;
  @Input() field: string;
  commentForm: FormGroup;
  comments: ProcessingCommentModel[];
  displayInput: boolean = false;

  constructor(
    private processingCommentApi: ProcessingCommentApi,
    private i18n: TranslateService
  ) {
  }

  ngOnInit() {
    this.commentForm = new FormGroup({
      content: new FormControl()
    });

    this.filterComments();
  }

  /**
   * Show or hide the block which allows users to create a new comment.
   * @memberof CommentsComponent
   */
  toggleCommentInput() {
    this.displayInput = !this.displayInput;
  }

  /**
   * Handle comment form submission
   * @memberof CommentsComponent
   */
  newComment() {
    const comment = new ProcessingCommentModel();

    comment.processing_id = this.processing.id;
    comment.content = this.commentForm.value.content;
    comment.field = this.field;

    this.processingCommentApi.create(comment).subscribe((newComment: ProcessingCommentModel) => {
      comment.fromJson(newComment);
      this.processing.comments.unshift(comment);
      this.filterComments();
      this.commentForm.controls['content'].setValue('');
    });
  }

  filterComments() {
    this.comments = this.processing.comments.filter(comment => comment.field === this.field);
    this.comments.map(comment => {
      if (comment.commented_by && comment.commented_by.roles) {
        const rolesLabel = [];
        comment.commented_by.roles.forEach(role => {
          rolesLabel.push(this.i18n.instant(`role_description.${role}.label`));
        })
        comment.commented_by.rolesLabel = rolesLabel.join('/');
      }
    });
  }

}
