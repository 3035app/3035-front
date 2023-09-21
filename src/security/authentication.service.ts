import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from 'environments/environment';
import { User } from '@security/user.model';
import { PermissionsService } from '@security/permissions.service';
import { UserProfileApi, UserTokenApi } from '@api/services';
import { UserProfileModel, UserTokenModel } from '@api/models';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AuthenticationService {
  private userToken: UserTokenModel = null;
  public profileSubject: BehaviorSubject<UserProfileModel> = new BehaviorSubject<UserProfileModel>(null)
  private readonly apiSettings: any = environment.api;
  private readonly dateFormat: string = environment.date_format;
  private _ownRoles: string[];

  constructor(
    private permissionsService: PermissionsService,
    private userProfileApi: UserProfileApi,
    private userTokenApi: UserTokenApi,
    private i18n: TranslateService,
  ) {
  }

  public authenticate(user: User): Promise<UserTokenModel> {

    return this.userTokenApi.getTokenFromLogin(user.username, user.password)
      .map((userToken: UserTokenModel) => {
        UserTokenModel.setLocalToken(userToken);
        this.userToken = userToken;
        this.fetchProfile();
        return userToken;
      }).toPromise();
  }

  public isAuthenticated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!UserTokenModel.hasLocalToken()) {
        resolve(false);
        return;
      }

      if (!this.userToken) {
        this.userToken = UserTokenModel.getLocalToken();
      }

      if (this.userToken.isExpired()) {
        resolve(false);
        return;
      }

      if (this.userToken.willExpireIn(300)) {
        this.refreshToken();
      }

      if (this.profileSubject.getValue() !== null) {
        resolve(true);
        return;
      }
      this.fetchProfile().then(() => {
        resolve(true);
      });
    });
  }

  public logout() {
    this.userToken = null;
    localStorage.removeItem('token');
  }

  protected fetchProfile(): Promise<UserProfileModel> {
    return new Promise((resolve, reject) => {
      this.userProfileApi.get().subscribe(
        (profile: UserProfileModel) => {
          this.profileSubject.next(profile);
          this.permissionsService.activateCurrentRoles(profile.roles);
          this._ownRoles = profile.roles;
        },
        (err) => {
          console.error(err);
          reject();
        },
        () => { resolve(this.profileSubject.getValue()); }
      );
    });
  }

  protected refreshToken() {

    return this.userTokenApi.refreshToken(this.userToken)
      .map((userToken: UserTokenModel) => {
        localStorage.setItem('token', userToken.toJsonString());
        this.userToken = userToken;
      }).toPromise();
  }

  public getOwnHigherRole(): {role: string, label: string, description: string} {
    let higherRole = { role: 'ROLE_USER', label: this.i18n.instant('role_description.ROLE_USER.label'), description: this.i18n.instant('role_description.ROLE_USER.description') };
    if (this._ownRoles) {
      this._ownRoles.forEach((role) => {
        higherRole = {role, label: this.i18n.instant(`role_description.${role}.label`), description: this.i18n.instant(`role_description.${role}.description`)};
      });
    }
    return higherRole;
  }
}
