import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Card } from 'reactbulma'
// import { loadBookInfo, renewBook } from '../actions'
import { Content, Level, Icon } from 'reactbulma'


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
      <Card key={this.props.vm.id}>
        <Card.Header>
          <Card.Header.Title>
            <strong>{this.props.vm.name}</strong>
          </Card.Header.Title>
        </Card.Header>
        <Card.Content>
          <Content>
            <p>
              ram: {this.props.vm.ram}
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
              <Level.Right>
                <Icon>
                  <i title="Renew" className="fa fa-retweet"/>
                </Icon>
            </Level.Right>
          </Level>
        </Card.Content>
        <Card.Footer>
          <Card.Footer.Item>Save</Card.Footer.Item>
          <Card.Footer.Item>Edit</Card.Footer.Item>
          <Card.Footer.Item>Delete</Card.Footer.Item>
        </Card.Footer>
      </Card>
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
