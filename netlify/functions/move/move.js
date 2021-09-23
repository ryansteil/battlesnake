const handler = async (event) => {
  try {
    const { game, turn, board, you } = JSON.parse(event.body);

    // try to eat the snakes if you are longer than them
    // TODO: fix this...
    // board.snakes.filter(d => d.length < you.length).forEach(snake => {
    //   if ((you.head.y === snake.head.y - 1) && (you.head.x === snake.head.x)) {
    //     return makeMove('up');
    //   }

    //   if ((you.head.y === snake.head.y + 1) && (you.head.x === snake.head.x)) {
    //     return makeMove('down');
    //   }

    //   if ((you.head.x === snake.head.x - 1) && (you.head.y === snake.head.y)) {
    //     return makeMove('right');
    //   }

    //   if ((you.head.x === snake.head.x + 1) && (you.head.y === snake.head.y)) {
    //     return makeMove('left');
    //   }
    // });


    const possibleMoves = computePossibleMoves(you, board);
    const desirableMove = computeDesirableMoves(you, board, possibleMoves);

    // const preferrentialMoves = Object.keys(desirableMoves).filter(key => desirableMoves[key]);
    // const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key]);

    // make a desirable move if you can, otherwise make a possible move
    // const move = preferrentialMoves.length > 0 ?
    //   preferrentialMoves[Math.floor(Math.random() * preferrentialMoves.length)] :
    //   safeMoves[Math.floor(Math.random() * safeMoves.length)];

    const move = desirableMove.length > 0 ? desirableMove[Math.floor(Math.random() * desirableMove.length)] : 'up';

    return makeMove(move);
  } catch (error) {
    console.log(error.toString());
    return { statusCode: 500, body: error.toString() }
  }
}

const computePossibleMoves = (you, board) => {
  const possibleMoves = {
    up: true,
    down: true,
    right: true,
    left: true
  };

  // don't run into the walls
  possibleMoves.up = you.head.y === board.height - 1 ? false : possibleMoves.up;
  possibleMoves.down = you.head.y === 0 ? false : possibleMoves.down;
  possibleMoves.right = you.head.x === board.width - 1 ? false : possibleMoves.right;
  possibleMoves.left = you.head.x === 0 ? false : possibleMoves.left;

  // don't run into the snakes
  board.snakes.forEach(snake => {
    // it's okay to move to where a tail exists, unless they just ate some food
    snake.body.slice(0, (snake.health === 100) * snake.body.length - (snake.health !== 100)).forEach(d => {
      possibleMoves.up = (you.head.y === d.y - 1) && (you.head.x === d.x) ? false : possibleMoves.up;
      possibleMoves.down = (you.head.y === d.y + 1) && (you.head.x === d.x) ? false : possibleMoves.down;
      possibleMoves.right = (you.head.x === d.x - 1) && (you.head.y === d.y) ? false : possibleMoves.right;
      possibleMoves.left = (you.head.x === d.x + 1) && (you.head.y === d.y) ? false : possibleMoves.left;
    });
  });

  return possibleMoves;
}

const computeDesirableMoves = (you, board, possibleMoves) => {
  const desirableMoves = {
    up: false,
    down: false,
    right: false,
    left: false
  };

  // don't starve
  board.food.forEach(d => {
    desirableMoves.up = (you.head.y === d.y - 1) && (you.head.x === d.x) && you.health < 25 ? true : desirableMoves.up;
    desirableMoves.down = (you.head.y === d.y + 1) && (you.head.x === d.x) && you.health < 25 ? true : desirableMoves.down;
    desirableMoves.right = (you.head.x === d.x - 1) && (you.head.y === d.y) && you.health < 25 ? true : desirableMoves.right;
    desirableMoves.left = (you.head.x === d.x + 1) && (you.head.y === d.y) && you.health < 25 ? true : desirableMoves.left;
  });

  // don't eat if you aren't hungry
  desirableMoves.up = board.food.filter(d => (d.y - 1 === you.head.y) && (d.x === you.head.x)).length === 0 && you.health >= 25 ?
    true : desirableMoves.up;

  desirableMoves.down = board.food.filter(d => (d.y + 1 === you.head.y) && (d.x === you.head.x)).length === 0 && you.health >= 25 ?
    true : desirableMoves.down;

  desirableMoves.right = board.food.filter(d => (d.x - 1 === you.head.x) && (d.y === you.head.y)).length === 0 && you.health >= 25 ?
    true : desirableMoves.right;

  desirableMoves.left = board.food.filter(d => (d.x + 1 === you.head.x) && (d.y === you.head.y)).length === 0 && you.health >= 25 ?
    true : desirableMoves.left;

  // don't move somewhere with no valid moves
  const upMoves = computePossibleMoves({ head: {x: you.head.x, y: you.head.y + 1}}, board);
  desirableMoves.up = Object.keys(upMoves).filter(key => upMoves[key]).length < 2 ? false : desirableMoves.up;

  const downMoves = computePossibleMoves({ head: {x: you.head.x, y: you.head.y - 1}}, board);
  desirableMoves.down = Object.keys(downMoves).filter(key => downMoves[key]).length < 2 ? false : desirableMoves.down;

  const rightMoves = computePossibleMoves({ head: {x: you.head.x + 1, y: you.head.y}}, board);
  desirableMoves.right = Object.keys(rightMoves).filter(key => rightMoves[key]).length < 2 ? false : desirableMoves.right;

  const leftMoves = computePossibleMoves({ head: {x: you.head.x - 1, y: you.head.y}}, board);
  desirableMoves.left = Object.keys(leftMoves).filter(key => leftMoves[key]).length < 2 ? false : desirableMoves.left;

  // explictly desire a move if you don't have any other options
  const desirableMove = [
    {
      move: 'up',
      possibleMoves: Object.keys(upMoves).filter(key => upMoves[key]).length
    },
    {
      move: 'down',
      possibleMoves: Object.keys(downMoves).filter(key => downMoves[key]).length
    },
    {
      move: 'right',
      possibleMoves: Object.keys(rightMoves).filter(key => rightMoves[key]).length
    },
    {
      move: 'left',
      possibleMoves: Object.keys(leftMoves).filter(key => leftMoves[key]).length
    }
  ].filter(d => possibleMoves[d.move]).sort((a, b) => b.possibleMoves - a.possibleMoves);

  let move = [];
  let maxPossibleMoves = 0;

  for (const d of desirableMove) {
    if (desirableMoves[d.move] && possibleMoves[d.move]) {
      if (d.possibleMoves >= maxPossibleMoves) {
        maxPossibleMoves = d.maxPossibleMoves;
        move.push(d.move);
      }
    }
  }

  if (move.length === 0) {
    for (const d of desirableMove) {
      if (possibleMoves[d.move]) {
        if (d.possibleMoves >= maxPossibleMoves) {
          maxPossibleMoves = d.maxPossibleMoves;
          move.push(d.move);
        }
      }
    }
  }

  return move;
}

const makeMove = move => ({
  statusCode: 200,
  body: JSON.stringify({
    move
  })
});

module.exports = { handler };
