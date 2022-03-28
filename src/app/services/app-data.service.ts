import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

import { PiaModel } from '@api/models';
import { PiaType } from '@api/model/pia.model';
import { UserApi } from '@api/services';

@Injectable()
export class AppDataService {

  private dataNav = { sections: null };
  private allUsers: any;

  constructor(
    private http: HttpClient,
    private userApi: UserApi,
    private i18n: TranslateService,
  ) {
    this.loadArchitecture();
    this.getAllUsers();
  }

  /**
   * Get the navigation data.
   * @returns {Object}
   * @memberof AppDataService
   */
  async getDataNav(pia?: PiaModel) {
    await this.loadArchitecture();
    
    if(pia) {
      if(pia.type == PiaType.regular) {
        delete this.dataNav.sections[3];
        delete this.dataNav.sections[2];
      }

      if(pia.type === PiaType.simplified) {
        delete this.dataNav.sections[3];
        delete this.dataNav.sections[2];
        delete this.dataNav.sections[1];
      }

      this.dataNav.sections = Object.values(this.dataNav.sections);
    }

    return this.dataNav;
  }

  /**
   * Load the architecture JSON file.
   * @private
   * @returns {Promise}
   * @memberof AppDataService
   */
  private async loadArchitecture() {
    return new Promise<void>((resolve, reject) => {
      this.http.get<any>('./assets/files/pia_architecture.json').subscribe(data => {
        this.dataNav = data;
        resolve();
      });
    });
  }

  private getAllUsers() {
    const structureId = parseInt(localStorage.getItem('structure-id'), 10)
    this.userApi.getAll(structureId).subscribe(users => {
      this.allUsers = users;
      this.allUsers = this.allUsers.map(user => {
        const rolesLabel = [];
        user.roles.forEach(role => {
          rolesLabel.push(this.i18n.instant(`role_description.${role}.label`));
        })
        user.roles = rolesLabel.join('/');
        return user;
      });
    });
  }
}
