import { Injectable } from '@angular/core';
import { BOARD_IDS } from './board-data';

// Single owner of "what boards exist" so Boards, BoardDetails, and Settings all read the same
// list instead of each importing BOARD_IDS from the fixture data directly.
@Injectable({ providedIn: 'root' })
export class BoardService {
  readonly boardIds: readonly string[] = BOARD_IDS;

  boardExists(boardId: string): boolean {
    return this.boardIds.includes(boardId);
  }
}
