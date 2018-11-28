import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { AppDataService } from '../services/app-data.service';
import { ModalsService } from '../modals/modals.service';

import { Observable } from 'rxjs/Observable';
import { RightsModel } from '@api/models';
import { RightsApi } from '@api/services';

@Injectable()
export class RightsService {

  rightss = [];
  rights: RightsModel = new RightsModel();
  data: { sections: any };

  constructor(
    private _router: Router,
    private _appDataService: AppDataService,
    private _modalsService: ModalsService,
    private rightsApi: RightsApi
  ) {
    this._appDataService.getDataNav().then((dataNav) => {
      this.data = dataNav;
    });
  }

  /**
   * Get the Rights.
   * @return {Promise}
   * @memberof RightsService
   * @deprecated
   */
  getRights() {
    console.warn('getRights is deprecated');
    return new Promise((resolve, reject) => { resolve(this.rights) });
  }

  /**
   * Get the current Rights.
   * @return { Observable<RightsModel> }
   * @memberof RightsService
   */
  retrieveCurrentRights(id: number): Observable<RightsModel> {
    return this.rightsApi.get(id).map((theRights: RightsModel) => {
      this.rights.fromJson(theRights);

      return this.rights;
    });

  }

  /**
   * Allows a user to remove a Rights.
   * @memberof RightsService
   */
  removeRights() {
    const rightsID = parseInt(localStorage.getItem('rights-id'), 10);
    // Deletes from DB.
    this.rightsApi.deleteById(rightsID).subscribe(() => {
      // Removes the Rights from the view.
      if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
        document.querySelector('.app-list-item[data-id="' + rightsID + '"]').remove();
      } else {
        document.querySelector('.rights-cardsBlock.rights[data-id="' + rightsID + '"]').remove();
      }

      localStorage.removeItem('rights-id');
    });


    this._modalsService.closeModal();
  }

  /**
   * Allows a user to abandon a rights (archive a Rights).
   * @memberof RightsService
   */
  abandonRights() {
    this.rightsApi.update(this.rights).subscribe((updatedRights: RightsModel) => {
      this.rights.fromJson(updatedRights);
      this._modalsService.closeModal();
      this._router.navigate(['home']);
    });
  }

  /**
   * Allow a user to duplicate a Rights.
   * @param {number} id - Rights id.
   * @memberof RightsService
   */
  duplicate(id: number) {
    this.exportData(id).then((data) => {
      this.importData(data, 'COPY', true);
    });
  }

  /**
   * Allow an user to export a Rights.
   * @param {number} id - The Rights id.
   * @returns {Promise}
   * @memberof RightsService
   */
  exportData(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.rightsApi.export(id).subscribe((json) => {
        resolve(json);
      });
    });
  }

  /**
   * Allows a user to import a Rights.
   * @param {*} data - Data Rights.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate Rights?
   * @param {boolean} [is_example] - Is the Rights example?
   * @memberof RightsService
   */
  async importData(data: any, prefix: string, is_duplicate: boolean, is_example?: boolean): Promise<void> {
    this.rightsApi.import(data).subscribe((rights) => {
      this.rightss.push(rights);
    });
  }

  /**
   * Download the Rights exported.
   * @param {number} id - The Rights id.
   * @memberof RightsService
   */
  export(id: number) {
    const date = new Date().getTime();
    this.exportData(id).then((data) => {
      const a = document.getElementById('rights-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_rights_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  /**
   * Import the Rights from file.
   * @param {*} file - The exported Rights file.
   * @memberof RightsService
   */
  async import(file: any) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    return new Promise((resolve, reject) => {
      reader.onload = async (event: any) => {
        const jsonFile = JSON.parse(event.target.result);
        await this.importData(jsonFile, 'IMPORT', false);
        resolve();
      }
    });
  }

  /**
   * Update current Rights
   * @returns {Observable<RightsModel>}
   * @memberof RightsService
   */
  public saveCurrentRights(): Observable<RightsModel> {
    return this.rightsApi.update(this.rights).map((updatedRights: RightsModel) => {
      this.rights = updatedRights;

      return this.rights;
    });
  }
}
