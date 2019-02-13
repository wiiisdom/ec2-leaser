import React, { Component } from 'react';
import {connect} from 'react-redux';
// import { loadBookInfo, renewBook } from '../actions'
import Media from 'react-bulma-components/lib/components/media';
import Content from 'react-bulma-components/lib/components/content';
import Card from 'react-bulma-components/lib/components/card';
import Heading from 'react-bulma-components/lib/components/heading';
import Columns from 'react-bulma-components/lib/components/columns';

class Vm extends Component {

  render() {
    const classes = `vm ${this.props.vm.state}`
    return (
      <Columns.Column size={3}>
      <Card className={classes}>
        <Card.Content>
          <Media>
            <Media.Item>
              <Heading size={4}>{this.props.vm.name}</Heading>
              <Heading subtitle size={6}>
                <span dangerouslySetInnerHTML={{__html: this.props.vm.description}} />
              </Heading>
            </Media.Item>

            <Media.Item renderAs="figure" position="right">
              <Heading size={6}>{this.props.vm.backend}</Heading>
            </Media.Item>
          </Media>
          <Content>
            <p>
              ram: {this.props.vm.ram}<br/>
              id: {this.props.vm.id}<br/>
              dns : {this.props.vm.dns}<br/>
              ip : {this.props.vm.ip}
              <br/>
            </p>
          </Content>
        </Card.Content>
        <Card.Footer>
          <Card.Footer.Item renderAs="a" href="#Yes">
            Do
          </Card.Footer.Item>
          <Card.Footer.Item renderAs="a" href="#No">
            Nothing
          </Card.Footer.Item>
          <Card.Footer.Item renderAs="a" href="#Maybe">
            Yey
          </Card.Footer.Item>
        </Card.Footer>
      </Card>
    </Columns.Column>
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
