import { combineReducers } from 'redux';
import backends from './backends';
import vms from './vms';

export default combineReducers({
  backends,
  vms,
});