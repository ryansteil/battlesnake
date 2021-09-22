const handler = async (event) => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        "apiversion": "1",
        "author": "ryansteil",
        "color" : "#B5F8FE",
        "head" : "default",
        "tail" : "default",
        "version" : "0.0.1-beta"
      }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler };
