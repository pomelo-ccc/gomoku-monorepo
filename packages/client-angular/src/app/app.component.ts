import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GomokuGame, Player, GameStatus } from '@gomoku-monorepo/core-gomoku';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    game!: GomokuGame;
    boardState: Player[][] = [];
    currentPlayer: Player = Player.BLACK;
    gameStatus: GameStatus = GameStatus.PLAYING;
    lastMove: { row: number; col: number } | null = null;

    // 暴露枚举供模板使用
    Player = Player;
    GameStatus = GameStatus;

    ngOnInit() {
        this.game = new GomokuGame();
        this.updateState();
    }

    get currentPlayerText(): string {
        if (this.gameStatus !== GameStatus.PLAYING) {
            return this.gameStatus === GameStatus.BLACK_WIN ? '🎉 黑子获胜!' :
                this.gameStatus === GameStatus.WHITE_WIN ? '🎉 白子获胜!' :
                    '🤝 平局!';
        }
        return this.currentPlayer === Player.BLACK ? '⚫ 黑子回合' : '⚪ 白子回合';
    }

    handleCellClick(row: number, col: number): void {
        const result = this.game.makeMove(row, col);

        if (result.success) {
            this.updateState();
        }
    }

    resetGame(): void {
        this.game.reset();
        this.updateState();
    }

    isLastMove(row: number, col: number): boolean {
        return this.lastMove?.row === row && this.lastMove?.col === col;
    }

    private updateState(): void {
        this.boardState = this.game.getBoardState();
        this.currentPlayer = this.game.getCurrentPlayer();
        this.gameStatus = this.game.getGameStatus();
        this.lastMove = this.game.getLastMove();
    }
}
