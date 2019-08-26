import React, { Component } from 'react';
import {connect} from 'react-redux';
import {loadBackends} from '../actions'
import Backend from './backend-item'

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
          <Backend key={item._id} backend={item}/>
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
