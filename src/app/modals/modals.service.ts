import {Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { PaginationService } from '../entry/entry-content/pagination.service';
import { UserApi } from '@api/services';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ModalsService {
  data: { elementId?: number, elementType?: string, elementUsers?: any[], users?: any[], processing?: any };

  constructor(
    private _router: Router,
    private _paginationService: PaginationService,
    private _userApi: UserApi,
    private i18n: TranslateService,
  ) {}

  /**
   * Opens a specific modal through its unique id.
   * @param {string} modal_id - Unique id of the modal which has to be opened.
   * @memberof ModalsService
   */
  async openModal(modal_id: string, data?: { elementId?: number, elementType?: string, elementUsers?: any[], users?: any[], processing?: any }) {
    if (modal_id === 'pia-declare-measures' ||
        modal_id === 'pia-action-plan-no-evaluation' ||
        modal_id === 'pia-dpo-missing-evaluations') {
      const mainContent = document.querySelector('.pia-entryContentBlock');
      if (mainContent) {
        mainContent.classList.add('blur-content');
      }
    } else {
      const header = document.querySelector('.pia-headerBlock');
      const container = document.querySelector('.pia-mainContainerBlock');
      header.classList.add('blur');
      container.classList.add('blur');
    }
    const e = <HTMLElement>document.getElementById(modal_id);
    e.classList.add('open');
    const gf = (<HTMLButtonElement>e.querySelector('.get-focus'));
    if (gf) {
      gf.focus();
    }
    
    if(modal_id === 'modal-list-new-folder' || modal_id === 'modal-list-new-processing' || modal_id === 'modal-list-new-pia') {
      const input = <HTMLInputElement>e.querySelector(modal_id === 'modal-list-new-pia' ? 'input#author_name' : 'input#name');
      if (input) {
        input.focus();
      }
    }
    this.data = data || {};
    if (modal_id === 'modal-list-element-permissions' || modal_id === 'modal-list-new-processing' || modal_id === 'modal-list-new-pia') {
      const structureId = parseInt(localStorage.getItem('structure-id'), 10)
      this._userApi.getAll(structureId).subscribe(users => {
        this.data.users = users;
        this.data.users = this.usersWithRolesLabel(this.data.users);
      })
      if (modal_id === 'modal-list-element-permissions') {
        if (data.elementType === 'folder') {
          this._userApi.getFolderUsers(this.data.elementId).subscribe(folderUsers => {
            this.data.elementUsers = folderUsers;
            this.data.elementUsers = this.usersWithRolesLabel(this.data.elementUsers);
          })
        }
        if (data.elementType === 'processing') {
          this._userApi.getProcessingUsers(this.data.elementId).subscribe(processingUsers => {
            this.data.elementUsers = processingUsers;
            this.data.elementUsers = this.usersWithRolesLabel(this.data.elementUsers);
          })
        }
      }
    }
  }

  /**
   * Returns a list of users with their translated role labels.
   * @param {array} users - user list.
   * @returns {array}
   * @memberof ModalsService
   */
  usersWithRolesLabel(users) {
    return users.map(user => {
      const rolesLabel = [];
      user.roles.forEach(role => {
        rolesLabel.push(this.i18n.instant(`role_description.${role}.label`));
      })
      user.roles = rolesLabel.join('/');
      return user;
    });
  }

  /**
   * Closes the current opened modal.
   * @memberof ModalsService
   */
  closeModal(pia_id?: number, toAction?: string) {
    const modal = document.querySelector('.pia-modalBlock.open');
    const mainContent = document.querySelector('.pia-entryContentBlock');
    if (mainContent) {
      mainContent.classList.remove('blur-content');
    }
    const header = document.querySelector('.pia-headerBlock');
    const container = document.querySelector('.pia-mainContainerBlock');
    header.classList.remove('blur');
    container.classList.remove('blur');
    modal.classList.remove('open');
    if (toAction && toAction.length > 0) {
      const goto = toAction.split('-');
      const goto_section_item = this._paginationService.getNextSectionItem(parseInt(goto[0], 10), parseInt(goto[1], 10))

      this._router.navigate([
        'entry',
        pia_id,
        'section',
        goto_section_item[0],
        'item',
        goto_section_item[1]
      ]);
    }
  }
}
