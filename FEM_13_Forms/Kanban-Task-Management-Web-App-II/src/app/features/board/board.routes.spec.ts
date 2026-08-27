import { authGuard } from '../../core/auth.guard';
import { BOARD_ROUTES } from './board.routes';

describe('BOARD_ROUTES', () => {
  it('leaves the boards list open to everyone', () => {
    const boardsList = BOARD_ROUTES.find((route) => route.path === '');

    expect(boardsList?.canActivate).toBeUndefined();
  });

  it('requires authentication to view a specific board (and its nested task route)', () => {
    const boardDetails = BOARD_ROUTES.find((route) => route.path === ':boardId');

    expect(boardDetails?.canActivate).toEqual([authGuard]);
    expect(boardDetails?.children?.some((child) => child.path === 'tasks/:taskId')).toBe(true);
  });
});
