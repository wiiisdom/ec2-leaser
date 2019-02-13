import axios from 'axios'

export const url = process.env.NODE_ENV === 'production' ? "/api/" : "http://localhost:5000/api/";

export const addBackendLoadVms = (backend) => {
  return (dispatch) => {
    dispatch(addBackend(backend));
    dispatch(loadVms(backend));
  }
}

export const loadBackends = () => {
  return (dispatch) => {
    axios.get(`${url}backend`)
    .then((res) => {
      let backends = res.data
      backends.forEach(function(backend) {
        dispatch(loadVms(backend))
      })
      dispatch({type:'LOAD_BACKENDS', payload: backends})
    }).catch((err) => {
      console.log(err)
    })
  }
}

export const loadVms = (backend) => {
  return (dispatch) => {
    axios.get(`${url}backend/${backend._id}`)
    .then((res) => {
      let vms = res.data

      // add backend name on vm
      vms.forEach((item) => {
        item.backend = backend.name
      })
      dispatch({type:'LOAD_VMS', payload: vms})
    }).catch((err) => {
      console.log(err)
      backend.err = err.message
      dispatch({type:'UPDATE_BACKEND', payload: backend})
    })
  }
}

export const addBackend = (backend) => {
  return {
    type: 'ADD_BACKEND',
    payload: backend
  }
}

export const deleteBackend = (backend) => {
  return {
    type: 'DELETE_BACKEND',
    payload: backend
  }
}

  export const deleteVms = (backend) => {
    return {
      type: 'DELETE_VMS',
      payload: backend
    }
}