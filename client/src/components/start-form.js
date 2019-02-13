import React, { Component } from 'react';
import { Control, Field } from 'react-bulma-components/lib/components/form'
import Button from 'react-bulma-components/lib/components/button';
import {connect} from 'react-redux';
import { startInstance, loadImages } from '../actions'

class StartForm extends Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.loadImages();
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    var instance = {};
    data.forEach(function(value, key){
        instance[key] = value;
    });

    if (instance === {}) {
      return;
    }
    this.props.startInstance(instance);
    document.getElementById("add-instance-form").reset();
  }

render() {
  return (
    <div>
    <h3 className="title is-3">Start Instance</h3>
    <p>Start a new instance here !</p>
    <form id="add-instance-form" onSubmit={this.handleSubmit}>
      <Field>
        <Control>
          <div className="select">
            <select id="image" name="image">
              {
                this.props.images &&
                this.props.images.map((item, key) =>
                <option key={key} value={item._id}>{item.name}</option>
              )
              }
            </select>
          </div>
        </Control>
        <Control>
          <input className="input"  id="name" name="name" placeholder="Instance Name" type="text" />
        </Control>
        <Control>
          <input className="input"  id="description" name="description" placeholder="Instance Description" type="text" />
        </Control>
      </Field>
      <Field>
        <Control>
          <Button>Start new instance</Button>
        </Control>
      </Field>
    </form>
  </div>
  );
  }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadImages: () => dispatch(loadImages()),
        startInstance: (instance) => dispatch(startInstance(instance))
    };
};

function mapStateToProps(state) {
  return {
    images: state.images,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StartForm);
