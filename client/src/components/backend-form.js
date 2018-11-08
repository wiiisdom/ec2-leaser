import React, { Component } from 'react';
import 'bulma/css/bulma.css';
import { Input, Button, Control, Field } from 'reactbulma'
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
    <h3 className="title is-3">Backends</h3>
    <p>Add a new backend here !</p>
    <form id="add-backend-form" onSubmit={this.handleSubmit}>
      <Field grouped>
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
          <Input id="name" name="name" placeholder="Name it !" type="text" />
        </Control>
      </Field>
      <Field>
        <Control>
          <Button type="submit">Save new backend</Button>
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
