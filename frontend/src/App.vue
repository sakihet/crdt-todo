<script setup lang="ts">
import * as Automerge from '@automerge/automerge'
import { ref } from 'vue'

let doc = Automerge.init()
doc = Automerge.change(doc, 'add task', d => {
  d.tasks = []
  d.tasks.push({ id: '6db3a402-4e8a-4604-a421-55695673f76a', name: 'task 1', done: false })
  d.tasks.push({ id: '7cc7dd32-53e9-4602-a576-00d6bbf90257', name: 'task 2', done: true })
})
console.log(doc)

const newTaskName = ref("")
const handleCheck = (id: string) => {
  console.log('check', id)
  // TODO
}
const handleDelete = (id: string) => {
  console.log('delete', id)
  // TODO
}
const handleSubmit = () => {
  console.log('submit', newTaskName.value)
  doc = Automerge.change(doc, 'add task', d => {
    // TODO
    d.tasks.push({ id: '95f6b946-790d-4bb3-bf3a-d4fb543c9b39', name: newTaskName.value, done: false })
  })
  newTaskName.value = ''
}
</script>

<template>
  <div>
    <h1>CRDT TODO</h1>
    <div>
      <form @submit.prevent="handleSubmit">
        <input
          type="text"
          v-model="newTaskName"
        />
      </form>
      <div>
        <ul v-for="t in doc.tasks">
          <li>
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
