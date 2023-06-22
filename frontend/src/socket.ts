import { io } from "socket.io-client"
import { store } from "./store"

const URL = 'ws://localhost:5000'
export const socket = io(URL)

// socket section
socket.on('connect', () => {
  console.log('socket connect')
  store.connected = true
})
socket.on('disconnect', () => {
  console.log('socket disconnect')
  store.connected = false
})
socket.on('message', (data) => {
  console.log('socket message', data)
})
