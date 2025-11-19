/**
 * 玩家类型
 */
export enum Player {
    NONE = 0,
    BLACK = 1,
    WHITE = 2,
}

/**
 * 游戏状态
 */
export enum GameStatus {
    PLAYING = 'PLAYING',
    BLACK_WIN = 'BLACK_WIN',
    WHITE_WIN = 'WHITE_WIN',
    DRAW = 'DRAW',
}

/**
 * 落子历史记录
 */
export interface MoveHistory {
    row: number;
    col: number;
    player: Player;
    timestamp: number;
}

/**
 * 胜利线位置
 */
export interface WinningLine {
    positions: Array<{ row: number; col: number }>;
    direction: 'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left';
}

/**
 * 落子结果
 */
export interface MoveResult {
    success: boolean;
    message?: string;
    winner?: Player;
    gameStatus: GameStatus;
    winningLine?: WinningLine;
}

/**
 * 游戏配置
 */
export interface GameConfig {
    timePerMove?: number; // 每步限时(秒)，0 表示无限时
    enableSound?: boolean; // 启用音效
}

/**
 * 玩家统计
 */
export interface PlayerStats {
    totalMoves: number;
    totalTime: number; // 总用时(毫秒)
    averageTime: number; // 平均每步用时(毫秒)
}

/**
 * 棋盘状态类型
 */
export type BoardState = Player[][];

/**
 * 五子棋游戏核心类 - 增强版
 */
export class GomokuGame {
    private readonly BOARD_SIZE = 15;
    private readonly WIN_COUNT = 5;
    private board: BoardState;
    private currentPlayer: Player;
    private gameStatus: GameStatus;
    private lastMove: { row: number; col: number } | null;
    private moveCount: number;
    private history: MoveHistory[];
    private winningLine: WinningLine | undefined;
    private config: GameConfig;

    // 计时相关
    private moveStartTime: number;
    private blackTotalTime: number; // 黑方总用时(毫秒)
    private whiteTotalTime: number; // 白方总用时(毫秒)

    constructor(config: GameConfig = {}) {
        this.config = {
            timePerMove: config.timePerMove || 0,
            enableSound: config.enableSound !== false,
        };

        this.board = this.createEmptyBoard();
        this.currentPlayer = Player.BLACK;
        this.gameStatus = GameStatus.PLAYING;
        this.lastMove = null;
        this.moveCount = 0;
        this.history = [];
        this.winningLine = undefined;
        this.moveStartTime = Date.now();
        this.blackTotalTime = 0;
        this.whiteTotalTime = 0;
    }

    /**
     * 创建空棋盘
     */
    private createEmptyBoard(): BoardState {
        return Array.from({ length: this.BOARD_SIZE }, () =>
            Array(this.BOARD_SIZE).fill(Player.NONE)
        );
    }

    /**
     * 落子
     */
    public makeMove(row: number, col: number): MoveResult {
        // 检查游戏是否已结束
        if (this.gameStatus !== GameStatus.PLAYING) {
            return {
                success: false,
                message: 'Game is already over',
                gameStatus: this.gameStatus,
            };
        }

        // 检查坐标是否有效
        if (!this.isValidPosition(row, col)) {
            return {
                success: false,
                message: 'Invalid position',
                gameStatus: this.gameStatus,
            };
        }

        // 检查位置是否已被占用
        if (this.board[row][col] !== Player.NONE) {
            return {
                success: false,
                message: 'Position already occupied',
                gameStatus: this.gameStatus,
            };
        }

        // 记录用时
        const now = Date.now();
        const moveTime = now - this.moveStartTime;

        if (this.currentPlayer === Player.BLACK) {
            this.blackTotalTime += moveTime;
        } else {
            this.whiteTotalTime += moveTime;
        }

        // 落子
        this.board[row][col] = this.currentPlayer;
        this.lastMove = { row, col };
        this.moveCount++;

        // 记录历史
        this.history.push({
            row,
            col,
            player: this.currentPlayer,
            timestamp: now,
        });

        // 检查胜负
        const winResult = this.checkWinWithLine(row, col);
        if (winResult.winner !== Player.NONE) {
            this.gameStatus =
                winResult.winner === Player.BLACK ? GameStatus.BLACK_WIN : GameStatus.WHITE_WIN;
            this.winningLine = winResult.line;
            return {
                success: true,
                winner: winResult.winner,
                gameStatus: this.gameStatus,
                winningLine: this.winningLine,
            };
        }

        // 检查平局（棋盘填满）
        if (this.moveCount === this.BOARD_SIZE * this.BOARD_SIZE) {
            this.gameStatus = GameStatus.DRAW;
            return {
                success: true,
                gameStatus: this.gameStatus,
            };
        }

        // 切换玩家
        this.currentPlayer =
            this.currentPlayer === Player.BLACK ? Player.WHITE : Player.BLACK;

        // 重置计时
        this.moveStartTime = Date.now();

        return {
            success: true,
            gameStatus: this.gameStatus,
        };
    }

    /**
     * 悔棋
     */
    public undo(): boolean {
        if (this.history.length === 0 || this.gameStatus !== GameStatus.PLAYING) {
            return false;
        }

        const lastMove = this.history.pop()!;
        this.board[lastMove.row][lastMove.col] = Player.NONE;
        this.moveCount--;

        // 恢复玩家
        this.currentPlayer = lastMove.player;

        // 更新最后一步
        this.lastMove = this.history.length > 0
            ? { row: this.history[this.history.length - 1].row, col: this.history[this.history.length - 1].col }
            : null;

        // 重置计时
        this.moveStartTime = Date.now();

        return true;
    }

    /**
     * 检查位置是否有效
     */
    private isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
    }

    /**
     * 检查胜负并返回胜利线 - 核心算法增强版
     */
    private checkWinWithLine(row: number, col: number): { winner: Player; line: WinningLine | undefined } {
        const player = this.board[row][col];
        if (player === Player.NONE) return { winner: Player.NONE, line: undefined };

        // 四个方向：横、竖、右斜、左斜
        const directions: Array<{ dr: number; dc: number; name: WinningLine['direction'] }> = [
            { dr: 0, dc: 1, name: 'horizontal' },
            { dr: 1, dc: 0, name: 'vertical' },
            { dr: 1, dc: 1, name: 'diagonal-right' },
            { dr: 1, dc: -1, name: 'diagonal-left' },
        ];

        for (const { dr, dc, name } of directions) {
            const line = this.getWinningLineInDirection(row, col, dr, dc, player);

            if (line.length >= this.WIN_COUNT) {
                return {
                    winner: player,
                    line: {
                        positions: line,
                        direction: name,
                    },
                };
            }
        }

        return { winner: Player.NONE, line: undefined };
    }

    /**
     * 获取某个方向上的连珠位置
     */
    private getWinningLineInDirection(
        row: number,
        col: number,
        dr: number,
        dc: number,
        player: Player
    ): Array<{ row: number; col: number }> {
        const positions: Array<{ row: number; col: number }> = [{ row, col }];

        // 正方向
        let r = row + dr;
        let c = col + dc;
        while (this.isValidPosition(r, c) && this.board[r][c] === player) {
            positions.push({ row: r, col: c });
            r += dr;
            c += dc;
        }

        // 反方向
        r = row - dr;
        c = col - dc;
        while (this.isValidPosition(r, c) && this.board[r][c] === player) {
            positions.unshift({ row: r, col: c });
            r -= dr;
            c -= dc;
        }

        return positions;
    }

    /**
     * 沿指定方向计数相同颜色的棋子
     */
    private countDirection(
        row: number,
        col: number,
        dr: number,
        dc: number,
        player: Player
    ): number {
        let count = 0;
        let r = row + dr;
        let c = col + dc;

        while (
            this.isValidPosition(r, c) &&
            this.board[r][c] === player
        ) {
            count++;
            r += dr;
            c += dc;
        }

        return count;
    }

    /**
     * 获取棋盘状态
     */
    public getBoardState(): BoardState {
        return this.board.map(row => [...row]);
    }

    /**
     * 获取当前玩家
     */
    public getCurrentPlayer(): Player {
        return this.currentPlayer;
    }

    /**
     * 检查游戏是否结束
     */
    public isGameOver(): boolean {
        return this.gameStatus !== GameStatus.PLAYING;
    }

    /**
     * 获取游戏状态
     */
    public getGameStatus(): GameStatus {
        return this.gameStatus;
    }

    /**
     * 获取最后一步落子位置
     */
    public getLastMove(): { row: number; col: number } | null {
        return this.lastMove ? { ...this.lastMove } : null;
    }

    /**
     * 获取胜利线
     */
    public getWinningLine(): WinningLine | undefined {
        return this.winningLine ? { ...this.winningLine } : undefined;
    }

    /**
     * 获取游戏历史
     */
    public getHistory(): MoveHistory[] {
        return [...this.history];
    }

    /**
     * 获取玩家统计
     */
    public getPlayerStats(player: Player): PlayerStats {
        const playerMoves = this.history.filter(m => m.player === player);
        const totalTime = player === Player.BLACK ? this.blackTotalTime : this.whiteTotalTime;

        return {
            totalMoves: playerMoves.length,
            totalTime,
            averageTime: playerMoves.length > 0 ? totalTime / playerMoves.length : 0,
        };
    }

    /**
     * 获取当前计时(自上次落子以来的时间)
     */
    public getCurrentMoveTime(): number {
        if (this.gameStatus !== GameStatus.PLAYING) return 0;
        return Date.now() - this.moveStartTime;
    }

    /**
     * 获取配置
     */
    public getConfig(): GameConfig {
        return { ...this.config };
    }

    /**
     * 更新配置
     */
    public updateConfig(config: Partial<GameConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * 重置游戏
     */
    public reset(): void {
        this.board = this.createEmptyBoard();
        this.currentPlayer = Player.BLACK;
        this.gameStatus = GameStatus.PLAYING;
        this.lastMove = null;
        this.moveCount = 0;
        this.history = [];
        this.winningLine = undefined;
        this.moveStartTime = Date.now();
        this.blackTotalTime = 0;
        this.whiteTotalTime = 0;
    }

    /**
     * 获取棋盘大小
     */
    public getBoardSize(): number {
        return this.BOARD_SIZE;
    }

    /**
     * 导出游戏状态（用于保存）
     */
    public exportState(): string {
        return JSON.stringify({
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            history: this.history,
            blackTotalTime: this.blackTotalTime,
            whiteTotalTime: this.whiteTotalTime,
            config: this.config,
        });
    }

    /**
     * 导入游戏状态（用于恢复）
     */
    public importState(stateJson: string): boolean {
        try {
            const state = JSON.parse(stateJson);
            this.board = state.board;
            this.currentPlayer = state.currentPlayer;
            this.gameStatus = state.gameStatus;
            this.history = state.history;
            this.blackTotalTime = state.blackTotalTime || 0;
            this.whiteTotalTime = state.whiteTotalTime || 0;
            this.config = state.config || {};
            this.moveCount = this.history.length;
            this.lastMove = this.history.length > 0
                ? { row: this.history[this.history.length - 1].row, col: this.history[this.history.length - 1].col }
                : null;
            this.moveStartTime = Date.now();

            // 重新检查是否有胜利线
            if (this.lastMove && this.gameStatus !== GameStatus.PLAYING) {
                const result = this.checkWinWithLine(this.lastMove.row, this.lastMove.col);
                this.winningLine = result.line;
            }

            return true;
        } catch (e) {
            return false;
        }
    }
}
