import axios from 'axios'

const url = process.env.NODE_ENV === 'production' ? "/api/" : "http://localhost:5000/api/"

export const addBackendLoadVms = (backend) => {
  return (dispatch) => {
    dispatch(addBackend(backend));
    dispatch(loadVms(backend));
  }
}

export const startInstance = (instance) => {
  return (dispatch) => {
    console.log(instance)
    axios.post(`${url}image/start`, instance)
    .then((res) => {
      dispatch({type:'UPDATE_BACKEND', payload: instance.image.backend})
    })
  }
}

export const loadImages = () => {
  return (dispatch) => {
    axios.get(`${url}image`)
    .then((res) => {
      let images = res.data
      dispatch({type:'LOAD_IMAGES', payload: images})
    }).catch((err) => {
      console.log(err)
    })
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