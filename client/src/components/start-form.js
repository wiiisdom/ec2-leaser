import React, { Component } from 'react';
import axios from 'axios';
import { Control, Field } from 'react-bulma-components/lib/components/form'
import Button from 'react-bulma-components/lib/components/button';
import { url, authHeader } from '../helpers';

class StartForm extends Component {
  state = {
    images: [],
    message: "",
    error: ""
  }
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    axios.get(`${url}image`, {
      headers: authHeader()
    })
    .then((res) => {
      let images = res.data
      this.setState({ images });
    }).catch((err) => {
      console.log("Errr " + err)
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ message: ""});
    this.setState({ error: "" });
    const data = new FormData(event.target);
    var instance = {};
    data.forEach(function(value, key){
        instance[key] = value;
    });

    if (instance === {}) {
      return;
    }
    axios.post(`${url}image/start`, instance, {
      headers: authHeader()
    })
    .then((res) => {
      console.log(res)
      this.setState({ message: res.data });
    }).catch((err) => {
      this.setState({ error: err.message });
    })
    document.getElementById("add-instance-form").reset();
  }

getClassName() {
  if(this.state.message) {
    return "success"
  }
  else if(this.state.error) {
    return "error"
  }
  else {
    return ""
  }
}

render() {
  return (
    <div className={this.getClassName()}>
    <h3 className="title is-3">Start Instance</h3>
    <p>Start a new instance here !</p>
    <form id="add-instance-form" onSubmit={this.handleSubmit}>
      <Field>
        <Control>
          <div className="select">
            <select id="image" name="image">
              {
                this.state.images.map((item, key) =>
                <option key={key} value={item._id}>{item.name} ({item.description})</option>
              )
              }
            </select>
          </div>
        </Control>
        <Control>
          <input className="input"  id="name" name="name" placeholder="Instance Name" type="text" required />
        </Control>
        <Control>
          <input className="input"  id="description" name="description" placeholder="Instance Description" type="text" required />
        </Control>
      </Field>
      <Field>
        <Control>
          <Button>Start new instance</Button>
        </Control>
      </Field>
    </form>
    <p>{this.state.message}</p>
    <p><strong>{this.state.error}</strong></p>
  </div>
  );
  }
}

export default StartForm;
