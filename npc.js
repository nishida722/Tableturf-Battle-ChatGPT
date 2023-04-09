function evaluateMove(block, x, y, rotation) {
    let score = 0;
  
    // Give higher scores to larger blocks
    const blockArea = block.reduce((acc, row) => acc + row.reduce((a, b) => a + b, 0), 0);
    score += blockArea;
  
    // Give higher scores to moves that fill corners
    const rotatedBlock = applyRotation(block, rotation);
    for (let i = 0; i < rotatedBlock.length; i++) {
      for (let j = 0; j < rotatedBlock[i].length; j++) {
        if (rotatedBlock[i][j]) {
          const newX = x + j;
          const newY = y + i;
          if (
            (newX === 0 && newY === 0) ||
            (newX === 0 && newY === canvas.height / blockSize - 1) ||
            (newX === canvas.width / blockSize - 1 && newY === 0) ||
            (newX === canvas.width / blockSize - 1 && newY === canvas.height / blockSize - 1)
          ) {
            score += 5;
          }
        }
      }
    }
  
    return score;
  }
  
  function npcMove() {
    let bestScore = -Infinity;
    let bestMove = null;
  
    for (let id = 0; id < blocks.length; id++) {
      for (let x = 0; x < canvas.width / blockSize; x++) {
        for (let y = 0; y < canvas.height / blockSize; y++) {
          for (let rotation = 0; rotation < 4; rotation++) {
            if (canPlaceBlock(blocks[id], x, y, rotation)) {
              const score = evaluateMove(blocks[id], x, y, rotation);
              if (score > bestScore) {
                bestScore = score;
                bestMove = { id, x, y, rotation };
              }
            }
          }
        }
      }
    }
  
    if (bestMove) {
        placedBlocks.push({
          id: bestMove.id,
          x: bestMove.x,
          y: bestMove.y,
          player: currentPlayer,
          rotation: bestMove.rotation,
        });
        
        redrawCanvas();

        switchPlayers();
      }
      
  }
  