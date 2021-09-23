const handler = async (event) => {
  try {
    const { game, turn, board, you } = JSON.parse(event.body);

    const possibleMoves = {
      up: true,
      down: true,
      right: true,
      left: true
    };

    possibleMoves.up = you.head.y === board.height - 1 ? false : possibleMoves.up;
    possibleMoves.down = you.head.y === 0 ? false : possibleMoves.down;
    possibleMoves.right = you.head.x === board.width - 1 ? false : possibleMoves.right;
    possibleMoves.left = you.head.x === 0 ? false : possibleMoves.left;

    board.snakes.filter(d => d.length >= you.length).forEach(snake => {
      snake.body.slice(0, -1).forEach(d => {
        possibleMoves.up = (you.head.y === d.y - 1) && (you.head.x === d.x) ? false : possibleMoves.up;
        possibleMoves.down = (you.head.y === d.y + 1) && (you.head.x === d.x) ? false : possibleMoves.down;
        possibleMoves.right = (you.head.x === d.x - 1) && (you.head.y === d.y) ? false : possibleMoves.right;
        possibleMoves.left = (you.head.x === d.x + 1) && (you.head.y === d.y) ? false : possibleMoves.left;
      });
    });

    board.snakes.filter(d => d.length < you.length).forEach(snake => {
      if ((you.head.y === snake.head.y - 1) && (you.head.x === snake.head.x)) {
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            move: 'up'
          }),
        }
      }

      if ((you.head.y === snake.head.y + 1) && (you.head.x === snake.head.x)) {
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            move: 'down'
          }),
        }
      }

      if ((you.head.x === snake.head.x - 1) && (you.head.y === snake.head.y)) {
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            move: 'right'
          }),
        }
      }

      if ((you.head.x === snake.head.x + 1) && (you.head.y === snake.head.y)) {
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            move: 'left'
          }),
        }
      }

      snake.body.slice(1, -1).forEach(d => {
        possibleMoves.up = (you.head.y === d.y - 1) && (you.head.x === d.x) ? false : possibleMoves.up;
        possibleMoves.down = (you.head.y === d.y + 1) && (you.head.x === d.x) ? false : possibleMoves.down;
        possibleMoves.right = (you.head.x === d.x - 1) && (you.head.y === d.y) ? false : possibleMoves.right;
        possibleMoves.left = (you.head.x === d.x + 1) && (you.head.y === d.y) ? false : possibleMoves.left;
      });
    });

    const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key]);
    const move = safeMoves[Math.floor(Math.random() * safeMoves.length)];

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        move
      }),
    }
  } catch (error) {
    console.log(error.toString());
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler };
