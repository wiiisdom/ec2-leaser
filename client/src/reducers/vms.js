const initialState = []
export default (state=initialState, action) => {
  switch (action.type) {
    case 'LOAD_VMS':
      console.log(action.payload)
      return state.concat(action.payload);
    case 'DELETE_VMS':
      return state.filter(vm => vm.backend !== action.payload.backend);
    default:
      return state
  }
}