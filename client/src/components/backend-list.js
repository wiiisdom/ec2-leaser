import React, { Component } from 'react';
import Media from 'react-bulma-components/lib/components/media'
import Content from 'react-bulma-components/lib/components/content'
import {connect} from 'react-redux';
import {loadBackends} from '../actions'

class BackendList extends Component {

  handleDeleteCard(e) {
    e.preventDefault();
  }

  componentDidMount() {
    this.props.loadBackends();
  }

  render() {
    return (
      <div>
      {
        this.props.backends &&
        this.props.backends.map((item, key) =>
          // eslint-disable-next-line
          <Media key={item._id} className={item.err !== undefined ? 'error' : ''}>
            <Media.Item>
              <Content>
                {item.name} {item.type} <strong>{item.err}</strong>
              </Content>
            </Media.Item>
          </Media>
      )
      }
    </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
      loadBackends: () => dispatch(loadBackends()),
  };
}

function mapStateToProps(state) {
  return {
    backends: state.backends,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BackendList);
