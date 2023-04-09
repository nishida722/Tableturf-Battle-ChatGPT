const canvas = document.getElementById('blokusCanvas');
const ctx = canvas.getContext('2d');
const blockSize = 20;
let selectedBlock = null;
let currentPlayer = 1;
let remainingTurns = 12;

const originalBlocks = [
    [
        [1, 1],
        [1, 0]
    ],
    [
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    [
        [1]
    ],
];

const blocks = originalBlocks.slice();

const placedBlocks = [];

const blockRotations = [0, 0, 0]; // Initialize rotation states for each block

function drawBlockOnCanvas(ctx, block, color, x, y) {
    ctx.fillStyle = color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    for (let i = 0; i < block.length; i++) {
        for (let j = 0; j < block[i].length; j++) {
            if (block[i][j]) {
                ctx.fillRect(x + j * blockSize, y + i * blockSize, blockSize, blockSize);
                ctx.strokeRect(x + j * blockSize, y + i * blockSize, blockSize, blockSize);
            }
        }
    }
}

function drawBlock(block, x, y, rotation = 0) {
    const rotatedBlock = applyRotation(block, rotation);
    const color = currentPlayer === 1 ? 'blue' : 'yellow';

    drawBlockOnCanvas(ctx, rotatedBlock, color, x * blockSize, y * blockSize);
}

function drawBlockPreview(blockId) {
    const canvas = document.getElementById(`block${blockId + 1}Preview`);
    const ctx = canvas.getContext('2d');
    canvas.width = blockSize * blocks[blockId][0].length;
    canvas.height = blockSize * blocks[blockId].length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBlockOnCanvas(ctx, blocks[blockId], 'blue', 0, 0);
}

function drawBoard() {
    for (let x = 0; x < canvas.width / blockSize; x++) {
        for (let y = 0; y < canvas.height / blockSize; y++) {
            // Replaced drawBlock() with drawBlockOnCanvas()
            drawBlockOnCanvas(ctx, [[1]], 'lightgray', x * blockSize, y * blockSize);
        }
    }
}

function drawSelectedBlock(block, x, y, color, rotation = 0) {
    const rotatedBlock = applyRotation(block, rotation);

    for (let i = 0; i < rotatedBlock.length; i++) {
        for (let j = 0; j < rotatedBlock[i].length; j++) {
            if (rotatedBlock[i][j]) {
                // Replaced drawBlock() with drawBlockOnCanvas()
                drawBlockOnCanvas(ctx, [[1]], color, (x + j) * blockSize, (y + i) * blockSize);
            }
        }
    }
}


function applyRotation(block, rotation) {
    let rotatedBlock = JSON.parse(JSON.stringify(block));
    for (let i = 0; i < rotation; i++) {
        rotatedBlock = rotateBlock(rotatedBlock);
    }
    return rotatedBlock;
}

function redrawCanvas() {
    drawBoard();
    placedBlocks.forEach(block => {
        const color = block.player === 1 ? 'blue' : 'yellow';
        drawSelectedBlock(blocks[block.id], block.x, block.y, color, block.rotation);
    });

    updateStats();
}

function canPlaceBlock(block, x, y, rotation = 0) {
    const rotatedBlock = applyRotation(block, rotation);

    let touching = placedBlocks.length === 0; // Allow the first block to be placed anywhere
    for (let i = 0; i < rotatedBlock.length; i++) {
        for (let j = 0; j < rotatedBlock[i].length; j++) {
            if (rotatedBlock[i][j]) {
                const newX = x + j;
                const newY = y + i;

                if (newX < 0 || newX >= canvas.width / blockSize || newY < 0 || newY >= canvas.height / blockSize) {
                    return false;
                }

                for (const placedBlock of placedBlocks) {
                    const placed = applyRotation(blocks[placedBlock.id], placedBlock.rotation);
                    for (let pi = 0; pi < placed.length; pi++) {
                        for (let pj = 0; pj < placed[pi].length; pj++) {
                            if (!placed[pi][pj]) continue;

                            const px = placedBlock.x + pj;
                            const py = placedBlock.y + pi;

                            if (px === newX && py === newY) {
                                return false; // Block overlaps another block
                            }

                            if (placedBlock.player === currentPlayer) {
                                if ((Math.abs(px - newX) <= 1 && py === newY) || (Math.abs(py - newY) <= 1 && px === newX) || (Math.abs(px - newX) === 1 && Math.abs(py - newY) === 1)) {
                                    touching = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return touching;
}

function hasValidMove(blockId, rotation) {
    for (let x = 0; x < canvas.width / blockSize; x++) {
      for (let y = 0; y < canvas.height / blockSize; y++) {
        if (canPlaceBlock(blocks[blockId], x, y, rotation)) {
          return true;
        }
      }
    }
    return false;
  }
  

function rotateBlock(block) {
    const newBlock = [];
    for (let x = 0; x < block[0].length; x++) {
        const newRow = [];
        for (let y = block.length - 1; y >= 0; y--) {
            newRow.push(block[y][x]);
        }
        newBlock.push(newRow);
    }
    return newBlock;
}

function rotateCurrentBlock(clockwise = true) {
    if (selectedBlock === null) return;
    blockRotations[selectedBlock] = (blockRotations[selectedBlock] + (clockwise ? 1 : -1) + 4) % 4;
    redrawCanvas();
}

function getBlockStats() {
    let player1Blocks = 0;
    let player2Blocks = 0;
    let player1Squares = 0;
    let player2Squares = 0;
  
    placedBlocks.forEach(block => {
      const rotatedBlock = applyRotation(blocks[block.id], block.rotation);
  
      const squareCount = rotatedBlock.reduce(
        (accumulator, row) => accumulator + row.filter(cell => cell).length,
        0
      );
  
      if (block.player === 1) {
        player1Blocks++;
        player1Squares += squareCount;
      } else {
        player2Blocks++;
        player2Squares += squareCount;
      }
    });
  
    return {
      player1Blocks,
      player2Blocks,
      player1Squares,
      player2Squares,
    };
  }

  function updateStats() {
    const stats = getBlockStats();
    document.getElementById("player1Blocks").innerText = stats.player1Blocks;
    document.getElementById("player2Blocks").innerText = stats.player2Blocks;
    document.getElementById("player1Squares").innerText = stats.player1Squares;
    document.getElementById("player2Squares").innerText = stats.player2Squares;
  }

  function switchPlayers() {
    currentPlayer = 3 - currentPlayer;
    remainingTurns -= 0.5;
    document.getElementById('turnDisplay').innerText = `Turns Remaining: ${remainingTurns}`;

    if (remainingTurns === 0) {
        const player1Squares = parseInt(document.getElementById('player1Squares').innerText);
        const player2Squares = parseInt(document.getElementById('player2Squares').innerText);
        if (player1Squares > player2Squares) {
            alert('Player 1 wins!');
        } else if (player1Squares < player2Squares) {
            alert('Player 2 wins!');
        } else {
            alert('It\'s a tie!');
        }
    }
}

drawBoard();

// Place starting 1x1 blocks for both players (assuming the 1x1 block is the last item in the array)
placedBlocks.push({ id: originalBlocks.length - 1, x: 0, y: 0, player: 1, rotation: 0 });
placedBlocks.push({ id: originalBlocks.length - 1, x: canvas.width / blockSize - 1, y: canvas.height / blockSize - 1, player: 2, rotation: 0 });
redrawCanvas();

for (let i = 0; i < blocks.length; i++) {
    drawBlockPreview(i);
}

canvas.addEventListener('click', (e) => {
    if (selectedBlock === null) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / blockSize);
    const y = Math.floor((e.clientY - rect.top) / blockSize);

    if (canPlaceBlock(blocks[selectedBlock], x, y, blockRotations[selectedBlock])) {
        placedBlocks.push({ id: selectedBlock, x, y, player: currentPlayer, rotation: blockRotations[selectedBlock] });

        redrawCanvas();

        // Call switchPlayers() to switch turns and update the turn display
        switchPlayers();

        // Trigger the custom event instead of calling npcMove() directly
        document.dispatchEvent(new Event('npcTurn'));
      }
});

canvas.addEventListener('mousemove', (e) => {
    if (selectedBlock === null) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / blockSize);
    const y = Math.floor((e.clientY - rect.top) / blockSize);

    redrawCanvas();

    const canPlace = canPlaceBlock(blocks[selectedBlock], x, y, blockRotations[selectedBlock]);
    const previewColor = canPlace ? (currentPlayer === 1 ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255, 255, 0, 0.5)') : 'rgba(255, 0, 0, 0.5)';
    drawSelectedBlock(blocks[selectedBlock], x, y, previewColor, blockRotations[selectedBlock]);
});

canvas.addEventListener('mouseout', (e) => {
    redrawCanvas();
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (e.deltaY < 0) {
        rotateCurrentBlock(true); // Rotate clockwise
    } else if (e.deltaY > 0) {
        rotateCurrentBlock(false); // Rotate counterclockwise
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / blockSize);
    const y = Math.floor((e.clientY - rect.top) / blockSize);

    redrawCanvas();

    const canPlace = canPlaceBlock(blocks[selectedBlock], x, y, blockRotations[selectedBlock]);
    const previewColor = canPlace ? (currentPlayer === 1 ? 'rgba(0, 0, 255, 0.5)' : 'rgba(255, 255, 0, 0.5)') : 'rgba(255, 0, 0, 0.5)';
    drawSelectedBlock(blocks[selectedBlock], x, y, previewColor, blockRotations[selectedBlock]);
});

// Add the event listener for the custom event
document.addEventListener('npcTurn', () => {
    npcMove();
  });

document.getElementById('block1').addEventListener('click', () => {
    selectedBlock = 0;
});

document.getElementById('block2').addEventListener('click', () => {
    selectedBlock = 1;
});

document.getElementById('block3').addEventListener('click', () => {
    selectedBlock = 2;
});

document.getElementById('block4').addEventListener('click', () => {
    selectedBlock = 3;
});