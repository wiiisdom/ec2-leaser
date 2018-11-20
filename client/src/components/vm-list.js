import React, { Component } from 'react';
import {connect} from 'react-redux';
import { loadVms } from '../actions'
import Vm from './vm-item'

import Columns from 'react-bulma-components/lib/components/columns';

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
      <Columns.Column>
        <h3 className="title is-3">Vms</h3>
        <Columns>
          {this.createListItems()}
        </Columns>
      </Columns.Column>
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
