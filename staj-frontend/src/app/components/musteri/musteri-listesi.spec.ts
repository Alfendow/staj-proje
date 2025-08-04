import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusteriListesiComponent } from './musteri-listesi';

describe('MusteriListesi', () => {
  let component: MusteriListesiComponent;
  let fixture: ComponentFixture<MusteriListesiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusteriListesiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusteriListesiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
