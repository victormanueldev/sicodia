import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsMasterPage } from './credits-master.page';

describe('CreditsMasterPage', () => {
  let component: CreditsMasterPage;
  let fixture: ComponentFixture<CreditsMasterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreditsMasterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditsMasterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
