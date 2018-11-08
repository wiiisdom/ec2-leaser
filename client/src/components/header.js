import React, { Component } from 'react';

class Header extends Component {

render() {
  return (
    <section className="hero is-primary">
      <div className="hero-body">
        <div className="container">
          <h1 className="title">
            VMLIST+++
          </h1>
          <h2 className="subtitle">
            See all VM of the company
          </h2>
        </div>
      </div>
    </section>
  );
  }
}

export default (Header);