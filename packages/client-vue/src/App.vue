<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { GomokuGame, Player, GameStatus } from '@gomoku-monorepo/core-gomoku';
import type { BoardState, WinningLine } from '@gomoku-monorepo/core-gomoku';

const game = ref(new GomokuGame({ timePerMove: 30 }));
const board = ref<BoardState>(game.value.getBoardState());
const currentPlayer = ref<Player>(game.value.getCurrentPlayer());
const gameStatus = ref<GameStatus>(game.value.getGameStatus());
const lastMove = ref<{ row: number; col: number } | null>(game.value.getLastMove());
const winningLine = ref<WinningLine | undefined>(undefined);
const moveTime = ref(0);
const timerInterval = ref<number | null>(null);

// 音效上下文
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

// 播放音效
const playSound = (type: 'move' | 'win' | 'start') => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  if (type === 'move') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'win') {
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } else if (type === 'start') {
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  }
};

const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value);
  moveTime.value = 0;
  timerInterval.value = window.setInterval(() => {
    moveTime.value = Math.floor(game.value.getCurrentMoveTime() / 1000);
  }, 100);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const updateGameState = () => {
  board.value = game.value.getBoardState();
  currentPlayer.value = game.value.getCurrentPlayer();
  gameStatus.value = game.value.getGameStatus();
  lastMove.value = game.value.getLastMove();
  winningLine.value = game.value.getWinningLine();
};

const handleCellClick = (row: number, col: number) => {
  if (gameStatus.value !== GameStatus.PLAYING) return;

  const result = game.value.makeMove(row, col);
  if (result.success) {
    playSound('move');
    updateGameState();
    
    if (result.gameStatus !== GameStatus.PLAYING) {
      stopTimer();
      if (result.winner) {
        playSound('win');
      }
    } else {
      startTimer(); // 重置计时
    }
  }
};

const resetGame = () => {
  game.value.reset();
  updateGameState();
  playSound('start');
  startTimer();
};

const undoMove = () => {
  if (game.value.undo()) {
    updateGameState();
    startTimer(); // 重置计时
  }
};

const statusMessage = computed(() => {
  switch (gameStatus.value) {
    case GameStatus.PLAYING:
      return `当前回合: ${currentPlayer.value === Player.BLACK ? '黑子' : '白子'}`;
    case GameStatus.BLACK_WIN:
      return '🎉 黑子获胜！';
    case GameStatus.WHITE_WIN:
      return '🎉 白子获胜！';
    case GameStatus.DRAW:
      return '🤝 平局！';
    default:
      return '';
  }
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const isWinningCell = (row: number, col: number) => {
  if (!winningLine.value) return false;
  return winningLine.value.positions.some(p => p.row === row && p.col === col);
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<template>
  <div class="game-container">
    <div class="glass-panel">
      <header class="header">
        <h1>五子棋 (Vue 3)</h1>
        <div class="status-bar">
          <div class="status" :class="{ 
            'black-turn': currentPlayer === Player.BLACK && gameStatus === GameStatus.PLAYING,
            'white-turn': currentPlayer === Player.WHITE && gameStatus === GameStatus.PLAYING,
            'winner': gameStatus !== GameStatus.PLAYING
          }">
            {{ statusMessage }}
          </div>
          <div class="timer">
            ⏱️ {{ formatTime(moveTime) }}
          </div>
        </div>
      </header>

      <div class="board-wrapper">
        <div class="board">
          <!-- 网格线 -->
          <div class="grid-lines">
            <div v-for="i in 15" :key="`h-${i}`" class="line horizontal" :style="{ top: `${(i-1) * 100 / 14}%` }"></div>
            <div v-for="i in 15" :key="`v-${i}`" class="line vertical" :style="{ left: `${(i-1) * 100 / 14}%` }"></div>
          </div>

          <!-- 棋子区域 -->
          <div class="cells">
            <div v-for="(row, rIndex) in board" :key="rIndex" class="row">
              <div 
                v-for="(cell, cIndex) in row" 
                :key="cIndex" 
                class="cell"
                @click="handleCellClick(rIndex, cIndex)"
              >
                <div 
                  class="piece" 
                  :class="{ 
                    'black': cell === Player.BLACK, 
                    'white': cell === Player.WHITE,
                    'last-move': lastMove?.row === rIndex && lastMove?.col === cIndex,
                    'winning': isWinningCell(rIndex, cIndex)
                  }"
                  v-if="cell !== Player.NONE"
                ></div>
                <div class="preview-piece" :class="{
                  'black': currentPlayer === Player.BLACK,
                  'white': currentPlayer === Player.WHITE
                }" v-if="cell === Player.NONE && gameStatus === GameStatus.PLAYING"></div>
              </div>
            </div>
          </div>
          
          <!-- 胜利线动画 -->
          <div v-if="winningLine" class="winning-line-overlay"></div>
        </div>
      </div>

      <div class="controls">
        <button class="btn secondary" @click="undoMove" :disabled="gameStatus !== GameStatus.PLAYING">
          ↩️ 悔棋
        </button>
        <button class="btn primary" @click="resetGame">
          🔄 重新开始
        </button>
      </div>
    </div>
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
