import React, { Component } from 'react';
import {connect} from 'react-redux';
// import { loadBookInfo, renewBook } from '../actions'
import { Media, Content, Level, Icon } from 'react-bulma-components/full'


class Vm extends Component {

  // componentDidMount() {
  //   this.props.loadBookInfo(this.props.book);
  // }

  // handleRenew(event) {
  //   console.log(event.target);
  //   this.props.renewBook(this.props.book);
  // }

  render() {
    return (
      <Media key={this.props.vm.id}>
        <strong>{this.props.vm.name}</strong>
        <strong>{this.props.vm.ram}</strong>
      </Media>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // loadBookInfo: (book) => dispatch(loadBookInfo(book)),
        // renewBook: (book) => dispatch(renewBook(book))
    };
};

export default connect(null, mapDispatchToProps)(Vm);
