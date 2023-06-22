<script setup lang="ts">
import * as Automerge from '@automerge/automerge'
import { io } from 'socket.io-client'
import { onUpdated, reactive, ref } from 'vue'

const newTaskName = ref("")
const state = reactive({
  connected: false,
  tasks: []
})
const url = 'ws://localhost:5000'
const socket = io(url)

// setup initial data
let currentDoc = Automerge.init()
currentDoc = Automerge.change(currentDoc, 'add task', d => {
  d.tasks = []
  d.tasks.push({ id: '6db3a402-4e8a-4604-a421-55695673f76a', name: 'task 1', done: false })
  d.tasks.push({ id: '7cc7dd32-53e9-4602-a576-00d6bbf90257', name: 'task 2', done: true })
})
state.tasks = currentDoc.tasks

// socket section
socket.on('connect', () => {
  state.connected = true
  console.log('socket connect')
})
socket.on('disconnect', () => {
  state.connected = false
  console.log('socket disconnect')
})
socket.on('message', (data) => {
  console.log('socket message', data)
})
socket.on('updates', (changes) => {
  console.log('socket updates', changes, Automerge.load(changes))
  const ary = new Uint8Array(changes)
  currentDoc = Automerge.merge(currentDoc, Automerge.load(ary))
  state.tasks = currentDoc.tasks
})

onUpdated(() => {
  console.log('updated')
})

const handleCheck = (id: string) => {
  console.log('check', id)
  // TODO
  socket.send('check')
}
const handleDelete = (id: string) => {
  console.log('delete', id)
  // TODO
  socket.send('delete')
}
const handleSubmit = async () => {
  console.log('submit', newTaskName.value)
  const uuid = crypto.randomUUID()
  const newTask = { id: uuid, name: newTaskName.value, done: false }
  let newDoc = Automerge.init()
  newDoc = Automerge.change(currentDoc, d => {
    d.tasks.push(newTask)
  })
  currentDoc = newDoc
  const binary = Automerge.save(newDoc)
  socket.send(binary)
  newTaskName.value = ''
}
</script>

<template>
  <div>
    <h1>CRDT TODO</h1>
    <div>socket connected: {{ state.connected }}</div>
    <!-- <div>{{ state.tasks }}</div> -->
    <hr />
    <div>
      <form @submit.prevent="handleSubmit">
        <input
          type="text"
          v-model="newTaskName"
        />
      </form>
      <div>
        <ul>
          <li v-for="t in state.tasks" :key="t.id">
            <div>
              <input
                type="checkbox"
                :checked="t.done"
                @change="handleCheck(t.id)"
              />
              <span>
                {{ t.name }}
              </span>
              <span> | </span>
              <button
                type="button"
                @click="handleDelete(t.id)"
              >x</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
