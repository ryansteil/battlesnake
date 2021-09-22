const handler = async (event) => {
  try {
    const { game, turn, board, you } = JSON.parse(event.body);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        move: 'right'
      }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler };
