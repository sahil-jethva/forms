import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespondFormsComponent } from './respond-forms.component';

describe('RespondFormsComponent', () => {
  let component: RespondFormsComponent;
  let fixture: ComponentFixture<RespondFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespondFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespondFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
