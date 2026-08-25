import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BoardDetails } from './board-details';

describe('BoardDetails', () => {
  let component: BoardDetails;
  let fixture: ComponentFixture<BoardDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardDetails],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
