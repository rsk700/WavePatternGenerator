import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveGenComponent } from './wave-gen.component';

describe('WaveGenComponent', () => {
  let component: WaveGenComponent;
  let fixture: ComponentFixture<WaveGenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaveGenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
