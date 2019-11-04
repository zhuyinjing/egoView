export const doneTodos = state => {
  return state.todos.filter(todo => todo.done)
}

export const getTodoById = (state) => (id) => {
  return state.todos.find(todo => todo.id === id)
}
