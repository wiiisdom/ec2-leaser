import React, { Component } from 'react';
import {connect} from 'react-redux';
import { loadVms } from '../actions'
import Vm from './vm-item'


class VmList extends Component {

  createListItems() {
    return this.props.vms.map(item => {
      return (
            <Vm key={item._id} vm={item}/>
      );
    });
  }

  render() {
    return (
      <div className="column">
        <h3 className="title is-3">Vms</h3>
        {this.createListItems()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    vms: state.vms,
    backends: state.backends
  };
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadVms: (backend) => dispatch(loadVms(backend))
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(VmList);
