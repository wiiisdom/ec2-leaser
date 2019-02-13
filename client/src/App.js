import React, { Component } from 'react'
import 'font-awesome/css/font-awesome.css'
import './App.css'
import 'bulma/css/bulma.css';
import Header from './components/header'
import BackendList from './components/backend-list'
import StartForm from './components/start-form'
import VmList from './components/vm-list'
import Section from 'react-bulma-components/lib/components/section'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Section>
          <div className="container">
          <VmList />

            <div className="columns">
              <div className="column">
                <StartForm />
              </div>
              <div className="column">
                <h3 className="title is-3">Backends</h3>
                <BackendList />
              </div>
            </div>
          </div>
        </Section>
      </div>
    );
  }
}

export default App;
