const board = Array.from({ length: 4 }, () => Array(4).fill(0));
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0; // 从localStorage加载历史最高分
let tiles = [];
let isAnimating = false;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newGameButton').addEventListener('click', newGame);
    document.getElementById('restartButton').addEventListener('click', newGame);
    document.getElementById('exitButton').addEventListener('click', () => {
        window.close(); // 关闭窗口
    });

    // 初始化历史最高分显示
    document.getElementById('bestScore').textContent = bestScore;

    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyPress);
    newGame();
});

function newGame() {
    board.forEach(row => row.fill(0));
    score = 0;
    updateScore();
    tiles.forEach(tile => tile.remove());
    tiles = [];
    generateNewNumber();
    generateNewNumber();
    renderTiles();
    document.getElementById('gameover').style.display = 'none';
}

function generateNewNumber() {
    let emptyCells = [];
    board.forEach((row, x) => {
        row.forEach((value, y) => {
            if (value === 0) {
                emptyCells.push({ x, y });
            }
        });
    });
    if (emptyCells.length === 0) return;
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[x][y] = Math.random() < 0.9 ? 2 : 4;
}

function renderTiles() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';
    tiles = [];
    board.forEach((row, x) => {
        row.forEach((value, y) => {
            if (value !== 0) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.textContent = value;
                tile.style.backgroundColor = getBackgroundColor(value);
                tile.style.transform = `translate(${y * 100}px, ${x * 100}px)`;
                tile.dataset.x = x;
                tile.dataset.y = y;
                gridContainer.appendChild(tile);
                tiles.push(tile);
            }
        });
    });
}

function getBackgroundColor(value) {
    switch (value) {
        case 2: return '#eee4da';
        case 4: return '#ede0c8';
        case 8: return '#f2b179';
        case 16: return '#f59563';
        case 32: return '#f67c5f';
        case 64: return '#f65e3b';
        case 128: return '#edcf72';
        case 256: return '#edcc61';
        case 512: return '#edc850';
        case 1024: return '#edc53f';
        case 2048: return '#edc22e';
        default: return '#cdc1b4';
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    if (score > bestScore) {
        bestScore = score;
        document.getElementById('bestScore').textContent = bestScore;
        localStorage.setItem("bestScore", bestScore); // 保存历史最高分到localStorage
    }
}

function isGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return false;
            if (i < 3 && board[i][j] === board[i + 1][j]) return false;
            if (j < 3 && board[i][j] === board[i][j + 1]) return false;
        }
    }
    return true;
}

function handleKeyPress(event) {
    if (isAnimating) return;

    switch (event.key) {
        case 'ArrowUp':
            moveTiles('up');
            break;
        case 'ArrowDown':
            moveTiles('down');
            break;
        case 'ArrowLeft':
            moveTiles('left');
            break;
        case 'ArrowRight':
            moveTiles('right');
            break;
        default:
            return; // 如果不是方向键，直接返回
    }

    // 检查游戏是否结束
    if (isGameOver()) {
        document.getElementById('gameover').style.display = 'block';
    }
}

function moveTiles(direction) {
    let moved = false;

    // 根据方向移动方块
    switch (direction) {
        case 'up':
            for (let y = 0; y < 4; y++) {
                for (let x = 1; x < 4; x++) {
                    if (board[x][y] !== 0) {
                        moved = moveTileTo(x, y, -1, 0) || moved;
                    }
                }
            }
            break;
        case 'down':
            for (let y = 0; y < 4; y++) {
                for (let x = 2; x >= 0; x--) {
                    if (board[x][y] !== 0) {
                        moved = moveTileTo(x, y, 1, 0) || moved;
                    }
                }
            }
            break;
        case 'left':
            for (let x = 0; x < 4; x++) {
                for (let y = 1; y < 4; y++) {
                    if (board[x][y] !== 0) {
                        moved = moveTileTo(x, y, 0, -1) || moved;
                    }
                }
            }
            break;
        case 'right':
            for (let x = 0; x < 4; x++) {
                for (let y = 2; y >= 0; y--) {
                    if (board[x][y] !== 0) {
                        moved = moveTileTo(x, y, 0, 1) || moved;
                    }
                }
            }
            break;
    }

    // 如果有方块移动，生成新数字并重新渲染
    if (moved) {
        setTimeout(() => {
            generateNewNumber();
            renderTiles();
        }, 150); // 延迟以等待动画完成
    }
}

function moveTileTo(x, y, dx, dy) {
    let moved = false;
    while (true) {
        const newX = x + dx;
        const newY = y + dy;

        // 检查边界
        if (newX < 0 || newX >= 4 || newY < 0 || newY >= 4) break;

        // 如果目标位置为空，移动方块
        if (board[newX][newY] === 0) {
            board[newX][newY] = board[x][y];
            board[x][y] = 0;
            x = newX;
            y = newY;
            moved = true;
        }
        // 如果目标位置的方块与当前方块相同，合并
        else if (board[newX][newY] === board[x][y]) {
            board[newX][newY] *= 2;
            score += board[newX][newY]; // 更新分数
            updateScore(); // 更新分数显示
            board[x][y] = 0;

            // 添加合并动画
            const mergedTile = document.querySelector(`.tile[data-x="${newX}"][data-y="${newY}"]`);
            if (mergedTile) {
                mergedTile.classList.add('merged'); // 添加 .merged 类
                setTimeout(() => {
                    mergedTile.classList.remove('merged'); // 动画完成后移除 .merged 类
                }, 150); // 与 CSS 动画时间一致
            }

            moved = true;
            break;
        } else {
            break;
        }
    }
    return moved;
}