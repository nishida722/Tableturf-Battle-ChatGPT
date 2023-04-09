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

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  function createDecks() {
    // Create a copy of the original blocks array
    const blocksCopy = JSON.parse(JSON.stringify(originalBlocks));
  
    // Shuffle the copied array
    const shuffledDeck = shuffle(blocksCopy);
  
    return shuffledDeck;
  }
  
  const player1Deck = createDecks();
  const player2Deck = createDecks();
  
  console.log("Player 1 Deck:", player1Deck);
  console.log("Player 2 Deck:", player2Deck);

// Create hands for each player
const player1Hand = drawCards(player1Deck, 4);
const player2Hand = drawCards(player2Deck, 4);

function drawCards(deck, numberOfCards) {
    // Take the specified number of cards from the top of the deck
    const drawnCards = deck.splice(0, numberOfCards);
  
    return drawnCards;
}

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

function drawBlockPreview(blockId, canvas) {
    const currentHand = currentPlayer === 1 ? player1Hand : player2Hand;
    
    if (currentHand[blockId] === undefined) {
        return;
    }
    
    const block = currentHand[blockId];
    const ctx = canvas.getContext('2d');
    canvas.width = blockSize * block[0].length;
    canvas.height = blockSize * block.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBlockOnCanvas(ctx, block, 'blue', 0, 0);
}

function drawBoard() {
    for (let x = 0; x < canvas.width / blockSize; x++) {
        for (let y = 0; y < canvas.height / blockSize; y++) {
            ctx.strokeStyle = 'lightgray';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
    }
}

function drawPlacedBlocks() {
    placedBlocks.forEach(block => {
        drawBlock(block.block, block.x, block.y, block.rotation);
    });
}

function applyRotation(block, rotation) {
    let rotatedBlock = JSON.parse(JSON.stringify(block));

    for (let r = 0; r < rotation; r++) {
        rotatedBlock = rotatedBlock[0].map((_, i) => rotatedBlock.map(row => row[i])).reverse();
    }

    return rotatedBlock;
}

function isValidMove(block, x, y, rotation) {
    const rotatedBlock = applyRotation(block, rotation);

    for (let i = 0; i < rotatedBlock.length; i++) {
        for (let j = 0; j < rotatedBlock[i].length; j++) {
            if (rotatedBlock[i][j]) {
                if (x + j < 0 || x + j >= canvas.width / blockSize ||
                    y + i < 0 || y + i >= canvas.height / blockSize) {
                    return false;
                }

                for (const placedBlock of placedBlocks) {
                    if (placedBlock.player === currentPlayer) {
                        continue;
                    }

                    const placedRotatedBlock = applyRotation(placedBlock.block, placedBlock.rotation);

                    if (y + i - placedBlock.y >= 0 && y + i - placedBlock.y < placedRotatedBlock.length &&
                        x + j - placedBlock.x >= 0 && x + j - placedBlock.x < placedRotatedBlock[0].length &&
                        placedRotatedBlock[y + i - placedBlock.y][x + j - placedBlock.x]) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function endTurn() {
    if (selectedBlock === null) {
        return;
    }

    const currentHand = currentPlayer === 1 ? player1Hand : player2Hand;
    const block = currentHand[selectedBlock];
    const rotation = blockRotations[selectedBlock];

    const x = Math.floor((canvas.width / 2 - blockSize * block[0].length / 2) / blockSize);
    const y = Math.floor((canvas.height / 2 - blockSize * block.length / 2) / blockSize);

    if (!isValidMove(block, x, y, rotation)) {
        return;
    }

    placedBlocks.push({
        block: block,
        x: x,
        y: y,
        rotation: rotation,
        player: currentPlayer
    });

    currentHand.splice(selectedBlock, 1);

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    remainingTurns--;

    if (remainingTurns <= 0) {
        // End game, calculate the winner
    }

    selectedBlock = null;
}

function drawCardsInHand() {
    const cardSize = 20;
    const margin = 5;
    const offsetX = 10;
    const offsetY = canvas.height - cardSize * 5 - margin * 5;
    
    for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        const player = players[playerIndex];
        
        for (let blockIndex = 0; blockIndex < player.blocks.length; blockIndex++) {
            const block = player.blocks[blockIndex];
            const xPos = offsetX + (cardSize + margin) * blockIndex;
            const yPos = offsetY + (cardSize + margin) * playerIndex;
            
            drawBlock(block, xPos, yPos, 0, cardSize / 5, player.color);
        }
    }
}

function drawBlockOutline() {
    if (selectedPlayerIndex === null || selectedBlockIndex === null) {
      return;
    }
  
    const cardSize = 20;
    const margin = 5;
    const offsetX = 10;
    const offsetY = canvas.height - cardSize * 5 - margin * 5;
  
    const xPos = offsetX + (cardSize + margin) * selectedBlockIndex;
    const yPos = offsetY + (cardSize + margin) * selectedPlayerIndex;
  
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(xPos - 2, yPos - 2, cardSize + 4, cardSize + 4);
  }

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawBlockOutline();
    drawCardsInHand();
}

function main() {
    draw();
    requestAnimationFrame(main);
}

canvas.addEventListener('click', endTurn);

main();


