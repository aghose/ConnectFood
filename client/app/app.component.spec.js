"use strict";var _testing=require("@angular/core/testing"),_app=require("./app.component");describe("AppComponent",function(){beforeEach(function(){_testing.TestBed.configureTestingModule({declarations:[_app.AppComponent]}),_testing.TestBed.compileComponents()}),it("should create the app",(0,_testing.async)(function(){var e=_testing.TestBed.createComponent(_app.AppComponent).debugElement.componentInstance;expect(e).toBeTruthy()})),it("should have as title 'app works!'",(0,_testing.async)(function(){var e=_testing.TestBed.createComponent(_app.AppComponent).debugElement.componentInstance;expect(e.title).toEqual("app works!")})),it("should render title in a h1 tag",(0,_testing.async)(function(){var e=_testing.TestBed.createComponent(_app.AppComponent);e.detectChanges();var t=e.debugElement.nativeElement;expect(t.querySelector("h1").textContent).toContain("app works!")}))});