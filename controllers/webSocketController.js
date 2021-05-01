
module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('a user connected.')
    socket.on('desconnect', () => {
      console.log('user disconnected')
    })
  })

};