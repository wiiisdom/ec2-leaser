import axios from "axios";
import { url, authHeader } from "../helpers";

export const loadBackends = () => {
  return (dispatch) => {
    axios
      .get(`${url}backend`, {
        headers: authHeader(),
      })
      .then((res) => {
        let backends = res.data;
        backends.forEach(function (backend) {
          backend.count = "?";
          backend.active = true;
          dispatch(loadVms(backend));
        });
        dispatch({ type: "LOAD_BACKENDS", payload: backends });
      })
      .catch((err) => {
        // if error we remove local storaqge to force user to re-auth
        localStorage.removeItem("user");
        // then reload page to present right screen
        window.location.reload();
        console.log(err);
      });
  };
};

export const switchBackend = (backend) => {
  return (dispatch) => {
    // switch active flag
    backend.active = !backend.active;
    dispatch({ type: "UPDATE_BACKEND", payload: backend });
    dispatch({ type: "UPDATE_VMS", payload: backend });
  };
};

export const loadVms = (backend) => {
  return (dispatch) => {
    axios
      .get(`${url}backend/${backend.name}`, {
        headers: authHeader(),
      })
      .then((res) => {
        let vms = res.data;

        // add backend name on vm
        vms.forEach((item) => {
          item.backend = backend.name;
          item.active = true;
        });
        // add vm count on backend
        backend.count = vms.length;

        dispatch({ type: "LOAD_VMS", payload: vms });
        dispatch({ type: "UPDATE_BACKEND", payload: backend });
      })
      .catch((err) => {
        console.log(err);
        backend.err = err.message;
        dispatch({ type: "UPDATE_BACKEND", payload: backend });
      });
  };
};
