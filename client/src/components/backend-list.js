import React, { Component } from 'react';
import Media from 'react-bulma-components/lib/components/media'
import Content from 'react-bulma-components/lib/components/content'
import Button from 'react-bulma-components/lib/components/button'
import {connect} from 'react-redux';
//import {bindActionCreators} from 'redux';
import {deleteBackend, loadBackends} from '../actions'

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
          <Media key={item._id}>
            <Media.Item>
              <Content>
                {item.name} {item.type}
              </Content>
            </Media.Item>
            <Button remove onClick={() => this.props.deleteBackend(key)} id={item.id} />
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
      deleteBackend: (backend) => dispatch(deleteBackend(backend)),
  };
}

function mapStateToProps(state) {
  return {
    backends: state.backends,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BackendList);
