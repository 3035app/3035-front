import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { AppDataService } from '../services/app-data.service';
import { ModalsService } from '../modals/modals.service';

import { Observable } from 'rxjs/Observable';
import { BreachModel } from '@api/models';
import { BreachApi } from '@api/services';

@Injectable()
export class BreachService {

  breachs = [];
  breach: BreachModel = new BreachModel();
  data: { sections: any };

  constructor(
    private _router: Router,
    private _appDataService: AppDataService,
    private _modalsService: ModalsService,
    private breachApi: BreachApi
  ) {
    this._appDataService.getDataNav().then((dataNav) => {
      this.data = dataNav;
    });
  }

  /**
   * Get the Breach.
   * @return {Promise}
   * @memberof BreachService
   * @deprecated
   */
  getBreach() {
    console.warn('getBreach is deprecated');
    return new Promise((resolve, reject) => { resolve(this.breach) });
  }

  /**
   * Get the current Breach.
   * @return { Observable<BreachModel> }
   * @memberof BreachService
   */
  retrieveCurrentBreach(id: number): Observable<BreachModel> {
    return this.breachApi.get(id).map((theBreach: BreachModel) => {
      this.breach.fromJson(theBreach);

      return this.breach;
    });

  }

  /**
   * Allows a user to remove a Breach.
   * @memberof BreachService
   */
  removeBreach() {
    const breachID = parseInt(localStorage.getItem('breach-id'), 10);
    // Deletes from DB.
    this.breachApi.deleteById(breachID).subscribe(() => {
      // Removes the Breach from the view.
      if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
        document.querySelector('.app-list-item[data-id="' + breachID + '"]').remove();
      } else {
        document.querySelector('.breach-cardsBlock.breach[data-id="' + breachID + '"]').remove();
      }

      localStorage.removeItem('breach-id');
    });


    this._modalsService.closeModal();
  }

  /**
   * Allows a user to abandon a breach (archive a Breach).
   * @memberof BreachService
   */
  abandonBreach() {
    this.breachApi.update(this.breach).subscribe((updatedBreach: BreachModel) => {
      this.breach.fromJson(updatedBreach);
      this._modalsService.closeModal();
      this._router.navigate(['home']);
    });
  }

  /**
   * Allow a user to duplicate a Breach.
   * @param {number} id - Breach id.
   * @memberof BreachService
   */
  duplicate(id: number) {
    this.exportData(id).then((data) => {
      this.importData(data, 'COPY', true);
    });
  }

  /**
   * Allow an user to export a Breach.
   * @param {number} id - The Breach id.
   * @returns {Promise}
   * @memberof BreachService
   */
  exportData(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.breachApi.export(id).subscribe((json) => {
        resolve(json);
      });
    });
  }

  /**
   * Allows a user to import a Breach.
   * @param {*} data - Data Breach.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate Breach?
   * @param {boolean} [is_example] - Is the Breach example?
   * @memberof BreachService
   */
  async importData(data: any, prefix: string, is_duplicate: boolean, is_example?: boolean): Promise<void> {
    this.breachApi.import(data).subscribe((breach) => {
      this.breachs.push(breach);
    });
  }

  /**
   * Download the Breach exported.
   * @param {number} id - The Breach id.
   * @memberof BreachService
   */
  export(id: number) {
    const date = new Date().getTime();
    this.exportData(id).then((data) => {
      const a = document.getElementById('breach-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_breach_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  /**
   * Import the Breach from file.
   * @param {*} file - The exported Breach file.
   * @memberof BreachService
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
   * Update current Breach
   * @returns {Observable<BreachModel>}
   * @memberof BreachService
   */
  public saveCurrentBreach(): Observable<BreachModel> {
    return this.breachApi.update(this.breach).map((updatedBreach: BreachModel) => {
      this.breach = updatedBreach;

      return this.breach;
    });
  }
}
