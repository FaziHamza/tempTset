import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationThemeComponent } from './application-theme.component';

describe('ApplicationThemeComponent', () => {
  let component: ApplicationThemeComponent;
  let fixture: ComponentFixture<ApplicationThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationThemeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
