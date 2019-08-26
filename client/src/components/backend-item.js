import React, { Component } from 'react';
import {updateBackend} from '../actions'
import {connect} from 'react-redux';
import Media from 'react-bulma-components/lib/components/media'
import Content from 'react-bulma-components/lib/components/content'

class Backend extends Component {
  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
    this.state = {active: true}
  }

  handleClick = (item) => {
    this.setState({active: !this.state.active})
    let backend = this.props.backend
    backend.active = this.state.active
    this.props.updateBackend(backend)
  }

  render() {
    return (
      <Media key={this.props.backend._id} className={this.props.backend.err !== undefined ? 'error' : (this.state.active ? 'active' : 'disabled')} onClick={(event) => this.handleClick(this.props.backend)}>
        <Media.Item>
          <Content>
            <strong>{this.props.backend.name}</strong> [{this.props.backend.type}] <strong>{this.props.backend.err}</strong> <i>({this.props.backend.count} instances)</i>
          </Content>
        </Media.Item>
      </Media>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
      updateBackend: (backend) => dispatch(updateBackend(backend)),
  };
}

export default connect(null, mapDispatchToProps)(Backend);
