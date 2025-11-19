import { useState, useCallback } from 'react'
import { GomokuGame, Player, GameStatus } from '@gomoku-monorepo/core-gomoku'
import './App.css'

const game = new GomokuGame()

function App() {
    const [boardState, setBoardState] = useState(game.getBoardState())
    const [currentPlayer, setCurrentPlayer] = useState(game.getCurrentPlayer())
    const [gameStatus, setGameStatus] = useState(game.getGameStatus())
    const [lastMove, setLastMove] = useState(game.getLastMove())

    const getCurrentPlayerText = () => {
        if (gameStatus !== GameStatus.PLAYING) {
            return gameStatus === GameStatus.BLACK_WIN ? '🎉 黑子获胜!' :
                gameStatus === GameStatus.WHITE_WIN ? '🎉 白子获胜!' :
                    '🤝 平局!'
        }
        return currentPlayer === Player.BLACK ? '⚫ 黑子回合' : '⚪ 白子回合'
    }

    const handleCellClick = useCallback((row: number, col: number) => {
        const result = game.makeMove(row, col)

        if (result.success) {
            setBoardState(game.getBoardState())
            setCurrentPlayer(game.getCurrentPlayer())
            setGameStatus(game.getGameStatus())
            setLastMove(game.getLastMove())
        }
    }, [])

    const resetGame = useCallback(() => {
        game.reset()
        setBoardState(game.getBoardState())
        setCurrentPlayer(game.getCurrentPlayer())
        setGameStatus(game.getGameStatus())
        setLastMove(game.getLastMove())
    }, [])

    const isLastMove = (row: number, col: number) => {
        return lastMove?.row === row && lastMove?.col === col
    }

    return (
        <div className="gomoku-container">
            <header className="header">
                <h1 className="title">
                    <span className="framework-badge react">React</span>
                    五子棋游戏
                </h1>
                <p className="subtitle">Framework: React 18 + TypeScript + Vite</p>
            </header>

            <div className="game-info">
                <div className="status-display">
                    {getCurrentPlayerText()}
                </div>
                <button className="reset-btn" onClick={resetGame}>
                    🔄 重新开始
                </button>
            </div>

            <div className="board-container">
                <div className="board">
                    {boardState.map((row, rowIndex) => (
                        <div key={rowIndex} className="board-row">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={colIndex}
                                    className={`board-cell ${isLastMove(rowIndex, colIndex) ? 'last-move' : ''}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                >
                                    {cell === Player.BLACK && <div className="piece black"></div>}
                                    {cell === Player.WHITE && <div className="piece white"></div>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <footer className="footer">
                <p>Built with ❤️ using Mono Repo Architecture</p>
            </footer>
        </div>
    )
}

export default App
