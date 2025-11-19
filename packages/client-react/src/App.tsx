import { useState, useEffect, useCallback, useRef } from 'react'
import { GomokuGame, Player, GameStatus } from '@gomoku-monorepo/core-gomoku'
import type { WinningLine } from '@gomoku-monorepo/core-gomoku'
import './App.css'

function App() {
    const [game] = useState(() => new GomokuGame({ timePerMove: 30 }))
    const [board, setBoard] = useState(game.getBoardState())
    const [currentPlayer, setCurrentPlayer] = useState(game.getCurrentPlayer())
    const [gameStatus, setGameStatus] = useState(game.getGameStatus())
    const [lastMove, setLastMove] = useState(game.getLastMove())
    const [winningLine, setWinningLine] = useState<WinningLine | undefined>(undefined)
    const [moveTime, setMoveTime] = useState(0)

    const timerRef = useRef<number | null>(null)
    const audioCtxRef = useRef<AudioContext | null>(null)

    // 初始化音效上下文
    useEffect(() => {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        return () => {
            if (audioCtxRef.current) audioCtxRef.current.close()
        }
    }, [])

    // 播放音效
    const playSound = useCallback((type: 'move' | 'win' | 'start') => {
        const ctx = audioCtxRef.current
        if (!ctx) return

        if (ctx.state === 'suspended') ctx.resume()

        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        if (type === 'move') {
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(400, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
            oscillator.start()
            oscillator.stop(ctx.currentTime + 0.1)
        } else if (type === 'win') {
            oscillator.type = 'triangle'
            oscillator.frequency.setValueAtTime(400, ctx.currentTime)
            oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1)
            oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2)
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5)
            oscillator.start()
            oscillator.stop(ctx.currentTime + 0.5)
        } else if (type === 'start') {
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(300, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2)
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
            oscillator.start()
            oscillator.stop(ctx.currentTime + 0.2)
        }
    }, [])

    // 计时器逻辑
    useEffect(() => {
        const startTimer = () => {
            if (timerRef.current) clearInterval(timerRef.current)
            setMoveTime(0)
            timerRef.current = window.setInterval(() => {
                setMoveTime(Math.floor(game.getCurrentMoveTime() / 1000))
            }, 100)
        }

        if (gameStatus === GameStatus.PLAYING) {
            startTimer()
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [game, gameStatus, currentPlayer]) // 依赖 currentPlayer 以便在回合切换时重置

    const updateGameState = useCallback(() => {
        setBoard(game.getBoardState())
        setCurrentPlayer(game.getCurrentPlayer())
        setGameStatus(game.getGameStatus())
        setLastMove(game.getLastMove())
        setWinningLine(game.getWinningLine())
    }, [game])

    const handleCellClick = useCallback((row: number, col: number) => {
        if (gameStatus !== GameStatus.PLAYING) return

        const result = game.makeMove(row, col)
        if (result.success) {
            playSound('move')
            updateGameState()

            if (result.winner) {
                playSound('win')
            }
        }
    }, [game, gameStatus, updateGameState, playSound])

    const resetGame = useCallback(() => {
        game.reset()
        updateGameState()
        playSound('start')
    }, [game, updateGameState, playSound])

    const undoMove = useCallback(() => {
        if (game.undo()) {
            updateGameState()
        }
    }, [game, updateGameState])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const isWinningCell = (row: number, col: number) => {
        if (!winningLine) return false
        return winningLine.positions.some(p => p.row === row && p.col === col)
    }

    const getStatusMessage = () => {
        switch (gameStatus) {
            case GameStatus.PLAYING:
                return `当前回合: ${currentPlayer === Player.BLACK ? '黑子' : '白子'}`
            case GameStatus.BLACK_WIN:
                return '🎉 黑子获胜！'
            case GameStatus.WHITE_WIN:
                return '🎉 白子获胜！'
            case GameStatus.DRAW:
                return '🤝 平局！'
            default:
                return ''
        }
    }

    return (
        <div className="game-container">
            <div className="glass-panel">
                <header className="header">
                    <h1>五子棋 (React 18)</h1>
                    <div className="status-bar">
                        <div className={`status ${currentPlayer === Player.BLACK && gameStatus === GameStatus.PLAYING ? 'black-turn' :
                                currentPlayer === Player.WHITE && gameStatus === GameStatus.PLAYING ? 'white-turn' :
                                    'winner'
                            }`}>
                            {getStatusMessage()}
                        </div>
                        <div className="timer">
                            ⏱️ {formatTime(moveTime)}
                        </div>
                    </div>
                </header>

                <div className="board-wrapper">
                    <div className="board">
                        <div className="grid-lines">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={`h-${i}`} className="line horizontal" style={{ top: `${(i) * 100 / 14}%` }}></div>
                            ))}
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={`v-${i}`} className="line vertical" style={{ left: `${(i) * 100 / 14}%` }}></div>
                            ))}
                        </div>

                        <div className="cells">
                            {board.map((row, rIndex) => (
                                <div key={rIndex} className="row">
                                    {row.map((cell, cIndex) => (
                                        <div
                                            key={cIndex}
                                            className="cell"
                                            onClick={() => handleCellClick(rIndex, cIndex)}
                                        >
                                            {cell !== Player.NONE && (
                                                <div className={`piece ${cell === Player.BLACK ? 'black' : 'white'
                                                    } ${lastMove?.row === rIndex && lastMove?.col === cIndex ? 'last-move' : ''
                                                    } ${isWinningCell(rIndex, cIndex) ? 'winning' : ''
                                                    }`}></div>
                                            )}
                                            {cell === Player.NONE && gameStatus === GameStatus.PLAYING && (
                                                <div className={`preview-piece ${currentPlayer === Player.BLACK ? 'black' : 'white'
                                                    }`}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="controls">
                    <button
                        className="btn secondary"
                        onClick={undoMove}
                        disabled={gameStatus !== GameStatus.PLAYING}
                    >
                        ↩️ 悔棋
                    </button>
                    <button className="btn primary" onClick={resetGame}>
                        🔄 重新开始
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App
