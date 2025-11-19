import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GomokuGame, Player, GameStatus } from '@gomoku-monorepo/core-gomoku';
import type { BoardState, WinningLine } from '@gomoku-monorepo/core-gomoku';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    game = new GomokuGame({ timePerMove: 30 });
    board: BoardState = [];
    currentPlayer: Player = Player.BLACK;
    gameStatus: GameStatus = GameStatus.PLAYING;
    lastMove: { row: number; col: number } | null = null;
    winningLine: WinningLine | undefined = undefined;
    moveTime = 0;

    Player = Player;
    GameStatus = GameStatus;

    private timerInterval: any = null;
    private audioCtx: AudioContext | null = null;

    ngOnInit() {
        this.updateGameState();
        this.initAudio();
        this.startTimer();
    }

    ngOnDestroy() {
        this.stopTimer();
        if (this.audioCtx) {
            this.audioCtx.close();
        }
    }

    initAudio() {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    playSound(type: 'move' | 'win' | 'start') {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        if (type === 'move') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.1);
        } else if (type === 'win') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(400, this.audioCtx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(600, this.audioCtx.currentTime + 0.1);
            oscillator.frequency.linearRampToValueAtTime(800, this.audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.5);
        } else if (type === 'start') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, this.audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.2);
        }
    }

    startTimer() {
        this.stopTimer();
        this.moveTime = 0;
        this.timerInterval = setInterval(() => {
            this.moveTime = Math.floor(this.game.getCurrentMoveTime() / 1000);
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateGameState() {
        this.board = this.game.getBoardState();
        this.currentPlayer = this.game.getCurrentPlayer();
        this.gameStatus = this.game.getGameStatus();
        this.lastMove = this.game.getLastMove();
        this.winningLine = this.game.getWinningLine();
    }

    handleCellClick(row: number, col: number) {
        if (this.gameStatus !== GameStatus.PLAYING) return;

        const result = this.game.makeMove(row, col);
        if (result.success) {
            this.playSound('move');
            this.updateGameState();

            if (result.gameStatus !== GameStatus.PLAYING) {
                this.stopTimer();
                if (result.winner) {
                    this.playSound('win');
                }
            } else {
                this.startTimer();
            }
        }
    }

    resetGame() {
        this.game.reset();
        this.updateGameState();
        this.playSound('start');
        this.startTimer();
    }

    undoMove() {
        if (this.game.undo()) {
            this.updateGameState();
            this.startTimer();
        }
    }

    getStatusMessage(): string {
        switch (this.gameStatus) {
            case GameStatus.PLAYING:
                return `当前回合: ${this.currentPlayer === Player.BLACK ? '黑子' : '白子'}`;
            case GameStatus.BLACK_WIN:
                return '🎉 黑子获胜！';
            case GameStatus.WHITE_WIN:
                return '🎉 白子获胜！';
            case GameStatus.DRAW:
                return '🤝 平局！';
            default:
                return '';
        }
    }

    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    isWinningCell(row: number, col: number): boolean {
        if (!this.winningLine) return false;
        return this.winningLine.positions.some(p => p.row === row && p.col === col);
    }
}
