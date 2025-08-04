import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KrediComponent } from './kredi.component';

describe('KrediComponent', () => {
  let component: KrediComponent;
  let fixture: ComponentFixture<KrediComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KrediComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KrediComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
