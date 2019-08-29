import React, { Component } from 'react';
import {switchBackend} from '../actions'
import {connect} from 'react-redux';
import Media from 'react-bulma-components/lib/components/media'
import Content from 'react-bulma-components/lib/components/content'

class Backend extends Component {
  render() {
    return (
      <Media key={this.props.backend._id} className={this.props.backend.err !== undefined ? 'error' : (this.props.backend.active ? 'active' : 'disabled')} onClick={(event) => this.props.switchBackend(this.props.backend)}>
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
      switchBackend: (backend) => dispatch(switchBackend(backend)),
  };
}

export default connect(null, mapDispatchToProps)(Backend);
