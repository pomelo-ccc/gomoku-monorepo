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
 * 落子结果
 */
export interface MoveResult {
    success: boolean;
    message?: string;
    winner?: Player;
    gameStatus: GameStatus;
}

/**
 * 棋盘状态类型
 */
export type BoardState = Player[][];

/**
 * 五子棋游戏核心类
 */
export class GomokuGame {
    private readonly BOARD_SIZE = 15;
    private readonly WIN_COUNT = 5;
    private board: BoardState;
    private currentPlayer: Player;
    private gameStatus: GameStatus;
    private lastMove: { row: number; col: number } | null;
    private moveCount: number;

    constructor() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = Player.BLACK; // 黑子先手
        this.gameStatus = GameStatus.PLAYING;
        this.lastMove = null;
        this.moveCount = 0;
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

        // 落子
        this.board[row][col] = this.currentPlayer;
        this.lastMove = { row, col };
        this.moveCount++;

        // 检查胜负
        const winner = this.checkWin(row, col);
        if (winner !== Player.NONE) {
            this.gameStatus =
                winner === Player.BLACK ? GameStatus.BLACK_WIN : GameStatus.WHITE_WIN;
            return {
                success: true,
                winner,
                gameStatus: this.gameStatus,
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

        return {
            success: true,
            gameStatus: this.gameStatus,
        };
    }

    /**
     * 检查位置是否有效
     */
    private isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
    }

    /**
     * 检查胜负 - 核心算法
     * 从刚落子的位置开始，检查四个方向是否有五子连珠
     */
    private checkWin(row: number, col: number): Player {
        const player = this.board[row][col];
        if (player === Player.NONE) return Player.NONE;

        // 四个方向：横、竖、左斜、右斜
        const directions = [
            { dr: 0, dc: 1 },  // 横
            { dr: 1, dc: 0 },  // 竖
            { dr: 1, dc: 1 },  // 右斜
            { dr: 1, dc: -1 }, // 左斜
        ];

        for (const { dr, dc } of directions) {
            let count = 1; // 当前位置已经是1个

            // 正方向计数
            count += this.countDirection(row, col, dr, dc, player);
            // 反方向计数
            count += this.countDirection(row, col, -dr, -dc, player);

            if (count >= this.WIN_COUNT) {
                return player;
            }
        }

        return Player.NONE;
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
        // 返回深拷贝，防止外部修改
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
     * 重置游戏
     */
    public reset(): void {
        this.board = this.createEmptyBoard();
        this.currentPlayer = Player.BLACK;
        this.gameStatus = GameStatus.PLAYING;
        this.lastMove = null;
        this.moveCount = 0;
    }

    /**
     * 获取棋盘大小
     */
    public getBoardSize(): number {
        return this.BOARD_SIZE;
    }
}
