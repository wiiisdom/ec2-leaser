import React, { Component } from 'react';
import { Control, Field } from 'react-bulma-components/lib/components/form'
import Button from 'react-bulma-components/lib/components/button';
import {connect} from 'react-redux';
import { addBackendLoadVms } from '../actions'

class BackendForm extends Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    var backend = {};
    data.forEach(function(value, key){
        backend[key] = value;
    });

    if (backend === {}) {
      return;
    }
    this.props.addBackendLoadVms(backend);
    document.getElementById("add-backend-form").reset();
  }

render() {
  return (
    <div>
    <p>Add a new backend here !</p>
    <form id="add-backend-form" onSubmit={this.handleSubmit}>
      <Field>
        <Control>
          <div className="select">
            <select id="type" name="type">
              <option value="aws">AWS</option>
              <option value="vmware">VMWare</option>
              <option value="xen">Xen</option>
            </select>
          </div>
        </Control>
        <Control>
          <input className="input"  id="name" name="name" placeholder="Name it !" type="text" />
        </Control>
      </Field>
      <Field>
        <Control>
          <Button>Save new backend</Button>
        </Control>
      </Field>
    </form>
  </div>
  );
  }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addBackendLoadVms: (card) => dispatch(addBackendLoadVms(card))
    };
};

export default connect(null, mapDispatchToProps)(BackendForm);
