import React, { Component } from 'react';
import {connect} from 'react-redux';
import { loadVms } from '../actions'
import Vm from './vm-item'

import Columns from 'react-bulma-components/lib/components/columns';
import Heading from 'react-bulma-components/lib/components/heading';
import Button from 'react-bulma-components/lib/components/button';
import {Field, Control} from 'react-bulma-components/lib/components/form';

class VmList extends Component {
  constructor() {
    super()
    this.state = {search: '', buttons : [
      {id:"starting", text: "Starting", state:true},
      {id:"running", text: "Running", state:true},
      {id: "terminated", text: "Stopping", state:true},
      {id: "stopped", text: "Stopped", state:true},
    ]}
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleButtonSwitch = this.handleButtonSwitch.bind(this);
  }

  handleChangeSearch = (event) => {
    this.setState({search: event.target.value});
  }

  handleButtonSwitch = (item) => {

    item.state = ! item.state
    this.setState({buttons: this.state.buttons.map(button => {
      if(button.id === item.id) {
        return {...button, ...item};
      }
      else{
        return button;
      }
    })});
  }

  createListItems() {
    return this.props.vms
      // filter backend active
      .filter(vm => {
        return vm.active
      })
      // filter search field
      .filter(vm => {
        if (vm.name) {
          return vm.name.includes(this.state.search)
        }
        else return true
      })
      // filter state field
      .filter(vm => {
        return this.state.buttons.filter(item => item.state).map(item => item.id).includes(vm.state)
      })
      .map(item => {
      return (
            <Vm key={item.id} vm={item}/>
      );
    });
  }

  createButtons() {
    return this.state.buttons.map(
      item => {
        return (
          <Control key={item.id}>
            <Button id={item.id} color={item.state ? 'primary' : ''} onClick={(event) => this.handleButtonSwitch(item)}>{item.text}</Button>
          </Control>
        )
      }
    )
  }

  render() {
    return (
      <div>
        <Heading size={3}>Vms</Heading>
        <Field kind="addons">
            {this.createButtons()}
          <Control>
            <input className="input" type="text" placeholder="Filter Vms" onChange={this.handleChangeSearch}></input>
          </Control>
        </Field>

        <Columns>
          {this.createListItems()}
        </Columns>
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
