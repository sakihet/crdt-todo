import * as http from 'http'
import { Server } from 'socket.io'

const port = 5000
const httpServer = http.createServer(
  (req, res) => {
    res.end('hello')
  }
)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
})
io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('message', (data) => {
    console.log('got message from client', data)
    io.emit('updates', data)
  })
})
httpServer.listen(port)
console.log(`server started: http://localhost:${port}`)
