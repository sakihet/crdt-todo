import { reactive } from "vue"

interface Store {
  connected: boolean,
  newTaskName: string,
  tasks: []
}

export const store: Store = reactive<Store>({
  connected: false,
  newTaskName: "",
  tasks: [],
})
