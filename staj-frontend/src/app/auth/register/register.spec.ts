import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusteriFormuComponent } from './register';

describe('MusteriFormu', () => {
  let component: MusteriFormuComponent;
  let fixture: ComponentFixture<MusteriFormuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusteriFormuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusteriFormuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
