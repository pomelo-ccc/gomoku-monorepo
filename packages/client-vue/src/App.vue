<script setup lang="ts">
import { ref, computed } from 'vue'
import { GomokuGame, Player, GameStatus } from '@gomoku-monorepo/core-gomoku'

const game = ref(new GomokuGame())
const boardState = ref(game.value.getBoardState())
const currentPlayer = ref(game.value.getCurrentPlayer())
const gameStatus = ref(game.value.getGameStatus())
const lastMove = ref(game.value.getLastMove())

const currentPlayerText = computed(() => {
  if (gameStatus.value !== GameStatus.PLAYING) {
    return gameStatus.value === GameStatus.BLACK_WIN ? '🎉 黑子获胜!' :
           gameStatus.value === GameStatus.WHITE_WIN ? '🎉 白子获胜!' :
           '🤝 平局!'
  }
  return currentPlayer.value === Player.BLACK ? '⚫ 黑子回合' : '⚪ 白子回合'
})

const handleCellClick = (row: number, col: number) => {
  const result = game.value.makeMove(row, col)
  
  if (result.success) {
    boardState.value = game.value.getBoardState()
    currentPlayer.value = game.value.getCurrentPlayer()
    gameStatus.value = game.value.getGameStatus()
    lastMove.value = game.value.getLastMove()
  }
}

const resetGame = () => {
  game.value.reset()
  boardState.value = game.value.getBoardState()
  currentPlayer.value = game.value.getCurrentPlayer()
  gameStatus.value = game.value.getGameStatus()
  lastMove.value = game.value.getLastMove()
}

const getCellClass = (row: number, col: number) => {
  const isLastMove = lastMove.value?.row === row && lastMove.value?.col === col
  return {
    'last-move': isLastMove
  }
}
</script>

<template>
  <div class="gomoku-container">
    <header class="header">
      <h1 class="title">
        <span class="framework-badge vue">Vue</span>
        五子棋游戏
      </h1>
      <p class="subtitle">Framework: Vue 3 + TypeScript + Vite</p>
    </header>

    <div class="game-info">
      <div class="status-display">
        {{ currentPlayerText }}
      </div>
      <button class="reset-btn" @click="resetGame">
        🔄 重新开始
      </button>
    </div>

    <div class="board-container">
      <div class="board">
        <div
          v-for="(row, rowIndex) in boardState"
          :key="rowIndex"
          class="board-row"
        >
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="board-cell"
            :class="getCellClass(rowIndex, colIndex)"
            @click="handleCellClick(rowIndex, colIndex)"
          >
            <div v-if="cell === Player.BLACK" class="piece black"></div>
            <div v-else-if="cell === Player.WHITE" class="piece white"></div>
          </div>
        </div>
      </div>
    </div>

    <footer class="footer">
      <p>Built with ❤️ using Mono Repo Architecture</p>
    </footer>
  </div>
</template>

<style scoped>
.gomoku-container {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.header {
  margin-bottom: 32px;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.framework-badge {
  font-size: 1rem;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.framework-badge.vue {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 20px;
}

.status-display {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  padding: 12px 24px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.reset-btn {
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.board-container {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.board {
  display: inline-block;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.board-row {
  display: flex;
}

.board-cell {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(139, 69, 19, 0.3);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-cell:hover {
  background: rgba(255, 255, 255, 0.2);
}

.board-cell.last-move {
  background: rgba(255, 107, 107, 0.3);
  animation: highlight 1s ease-in-out;
}

@keyframes highlight {
  0%, 100% { background: rgba(255, 107, 107, 0.3); }
  50% { background: rgba(255, 107, 107, 0.6); }
}

.piece {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  animation: dropIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes dropIn {
  0% {
    transform: translate(-50%, -150%) scale(0);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

.piece.black {
  background: radial-gradient(circle at 30% 30%, #4a4a4a, #000);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.2);
}

.piece.white {
  background: radial-gradient(circle at 30% 30%, #fff, #e0e0e0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.1);
}

.footer {
  margin-top: 32px;
  color: #888;
  font-size: 0.9rem;
}
</style>
