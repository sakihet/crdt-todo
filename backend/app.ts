import * as http from 'http'

const port = 5000

const server = http.createServer(
  (req, res) => {
    res.end('hello')
  }
)

server.listen(port)
console.log(`server started: http://localhost:${port}`)
