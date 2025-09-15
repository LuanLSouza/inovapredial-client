import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildingsPage } from './buildings.page';

describe('BuildingsPage', () => {
  let component: BuildingsPage;
  let fixture: ComponentFixture<BuildingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
