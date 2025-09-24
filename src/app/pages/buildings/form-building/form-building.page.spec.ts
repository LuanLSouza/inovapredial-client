import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuildingPage } from './form-building.page';

describe('FormBuildingPage', () => {
  let component: FormBuildingPage;
  let fixture: ComponentFixture<FormBuildingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormBuildingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
