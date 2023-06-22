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
  d.tasks.push({ id: '6db3a402-4e8a-4604-a421-55695673f76a', name: 'task 1', done: false })
  d.tasks.push({ id: '7cc7dd32-53e9-4602-a576-00d6bbf90257', name: 'task 2', done: true })
})
store.tasks = currentDoc.tasks

const handleCheck = (id: string) => {
  console.log('check', id)
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
  console.log('delete', id)
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
  console.log('submit', store.newTaskName)
  const uuid = crypto.randomUUID()
  const newTask = { id: uuid, name: store.newTaskName, done: false }
  let newDoc = Automerge.init()
  newDoc = Automerge.change(currentDoc, d => {
    d.tasks.push(newTask)
  })
  currentDoc = newDoc
  store.tasks = currentDoc.tasks
  const binary = Automerge.save(newDoc)
  socket.send(binary)
  store.newTaskName = ''
}
</script>

<template>
  <div>
    <h1>CRDT TODO</h1>
    <div>socket connected: {{ store.connected }}</div>
    <!-- <div>{{ state.tasks }}</div> -->
    <hr />
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
