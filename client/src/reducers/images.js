const initialState = []
export default (state=initialState, action) => {
  switch (action.type) {
    case 'ADD_IMAGE':
      let index = state.findIndex(el => el.code === action.payload.code);
      if(index===-1)
        return [
            ...state,
            action.payload
          ]
      return state;
    case 'DELETE_IMAGE':
      return [
          ...state.slice(0, action.payload),
          ...state.slice(action.payload + 1)
      ]
    case 'UPDATE_IMAGE':
      return state.map(backend => {
        if(backend._id === action.payload._id) {
          return {...backend, ...action.payload};
        }
        else{
          return backend;
        }
      })
    case 'LOAD_IMAGES':
      // return {
      //   backends: action.payload
      // }
      return action.payload
    default:
    return state
  }
}