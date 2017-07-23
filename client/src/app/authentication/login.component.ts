import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { LoginModel } from './login-model'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ LoginService ]
})
export class LoginComponent extends DialogComponent<null, boolean> {

  public loginModel : LoginModel;

  constructor (
    public dialogService: DialogService,
    private authenticationService: LoginService
  )
  {
    super(dialogService);
    this.loginModel = new LoginModel();
  }

  loginUser(event) {
    event.preventDefault();

    var observer = this.authenticationService.login(this.loginModel);
    // This is the promise we get
    observer.subscribe(
      data => {
        // Fill our model with the JSON result and see if Login is a success.
        this.loginModel.processLoginResult(data.success, data.appUserKey, data.username);
        if (data.success) this.close();
      },
      error => {
        console.log(error);
        // Shouldn't happen!
      }
    );

    // TODO: We should put some loading symbol in login popup here!!!
  }
}
