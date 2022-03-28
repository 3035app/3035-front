import { ErrorHandler, Inject, Injector, Injectable, NgZone, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@security/authentication.service'

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private higherRole: {role: string, label: string, description};

  constructor(
    private i18n: TranslateService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  private get toastr(): ToastrService {
    return this.injector.get(ToastrService);
  }

  private get zone(): NgZone {
    return this.injector.get(NgZone);
  }

  private get router(): Router {
    return this.injector.get(Router);
  }

  private get auth(): AuthenticationService {
    return this.injector.get(AuthenticationService);
  }

  handleHttpError(httpError: HttpErrorResponse) {
    this.higherRole = this.auth.getOwnHigherRole();

    let trans = 'messages.http.' + httpError.status;

    if (httpError.error.error_code) {
      trans = trans + '.' + httpError.error.error_code;
    }

    if (httpError.error.message && httpError.error.message.includes('messages.http.403')) {
      trans += `.${httpError.error.message.replace('messages.http.403.', '')}`;
    }

    this.toastr.error(
      this.i18n.instant(trans+'.content', { role_label: this.higherRole.label }),
      this.i18n.instant(trans+'.title')
    );
    switch (httpError.status) {
      case 401:
        this.auth.logout();
        this.zone.run(() => this.router.navigate([""]));
        break;
      default:

    }
  }

  handleClientError(error: Error) {
    this.toastr.error(
      this.i18n.instant('messages.client_error.content'),
      this.i18n.instant('messages.client_error.title')
    );
  }

  handleError(error: Error | HttpErrorResponse) {

    // WORKAROUND: Fixing infinite loop template error. See https://github.com/angular/angular/issues/17010

    const debugCtx = error['ngDebugContext'];
    const changeDetectorRef = debugCtx && debugCtx.injector.get(ChangeDetectorRef);
    if (changeDetectorRef) {
      changeDetectorRef.detach();
    }

    // END WORKAROUND

    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }

    console.error("Error happens", error || error.message);
  }

}
