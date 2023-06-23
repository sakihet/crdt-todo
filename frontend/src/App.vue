<script setup lang="ts">
import * as Automerge from '@automerge/automerge'
import { socket } from './socket'
import { store } from './store'

let currentDoc = Automerge.init()

socket.on('updates', (changes) => {
  console.log('socket updates', changes, Automerge.load(changes))
  const ary = new Uint8Array(changes)
  currentDoc = Automerge.merge(currentDoc, Automerge.load(ary))
  store.tasks = currentDoc.tasks
})

// setup initial data
currentDoc = Automerge.change(currentDoc, 'add task', d => {
  d.tasks = []
})
store.tasks = currentDoc.tasks

const handleCheck = (id: string) => {
  let newDoc = Automerge.init()
  const idx = currentDoc.tasks.findIndex(x => x.id == id)
  newDoc = Automerge.change(currentDoc, d => {
    const task = d.tasks[idx]
    d.tasks[idx] = {...task, done: !task.done}
  })
  currentDoc = newDoc
  const binary = Automerge.save(currentDoc)
  socket.send(binary)
}
const handleDelete = (id: string) => {
  let newDoc = Automerge.init()
  const idx = currentDoc.tasks.findIndex(x => x.id == id)
  newDoc = Automerge.change(currentDoc, d => {
    d.tasks.deleteAt(idx)
  })
  currentDoc = newDoc
  const binary = Automerge.save(currentDoc)
  socket.send(binary)
}
const handleSubmit = async () => {
  const newTask = { id: crypto.randomUUID(), name: store.newTaskName, done: false }
  let newDoc = Automerge.init()
  newDoc = Automerge.change(currentDoc, d => {
    d.tasks.push(newTask)
  })
  currentDoc = newDoc
  const binary = Automerge.save(newDoc)
  socket.send(binary)
  store.newTaskName = ''
}
</script>

<template>
  <div>
    <h1>CRDT TODO</h1>
    <div>socket connected: {{ store.connected }}</div>
    <div>
      <form @submit.prevent="handleSubmit">
        <input
          type="text"
          v-model="store.newTaskName"
        />
      </form>
      <div>
        <ul>
          <li v-for="t in store.tasks" :key="t.id">
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
