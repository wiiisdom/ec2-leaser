import React, { Component } from 'react';
import {connect} from 'react-redux';
// import { loadBookInfo, renewBook } from '../actions'
import { Media, Content, Level, Icon } from 'reactbulma'


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
        <Media.Content>
          <Content>
            <p>
              <strong>{this.props.vm.name}</strong>
              <strong>{this.props.vm.ram}</strong>
              <br/>
              id: {this.props.vm.id}
              <br/>
            </p>
          </Content>
          <Level mobile>
            <Level.Left>
              <Level.Item>
                <Icon small>
                  <i className="fa fa-reply" />
                </Icon>
              </Level.Item>
              <Level.Item>
                <Icon small>
                  <i className="fa fa-retweet"/>
                </Icon>
              </Level.Item>
            </Level.Left>
          </Level>
        </Media.Content>
        <Media.Right>
            <Icon>
              <i title="Renew" className="fa fa-retweet"/>
            </Icon>
        </Media.Right>
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
