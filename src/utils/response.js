const generateResponse = (message)=> {
  return {
    text: message,
    createdAt: new Date().getTime()
  }
}
module.exports = generateResponse;