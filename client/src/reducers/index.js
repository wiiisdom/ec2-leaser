import { combineReducers } from 'redux';
import backends from './backends';
import vms from './vms';
import images from './images';

export default combineReducers({
  backends,
  vms,
  images,
});