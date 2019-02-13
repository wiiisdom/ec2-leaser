import React, { Component } from 'react'
import 'font-awesome/css/font-awesome.css'
import './App.css'
import 'bulma/css/bulma.css';
import Header from './components/header'
import BackendForm from './components/backend-form'
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
          <StartForm />
            <div className="columns">
              <div className="column">
                <BackendForm />
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
