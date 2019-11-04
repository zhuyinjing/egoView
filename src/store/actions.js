export const increment = ({commit}) => {
  return new Promise ((resolve) => {
    setTimeout(() => {
      commit('increment')
      resolve()
    }, 5000)
  })
}
