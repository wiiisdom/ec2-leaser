import React, { Component } from 'react'
import 'font-awesome/css/font-awesome.css'
import Header from './components/header'
import BackendForm from './components/backend-form'
import BackendList from './components/backend-list'
import VmList from './components/vm-list'
import Section from 'react-bulma-components/lib/components/section'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Section>
          <div className="container">
            <div className="columns">
              <div className="column">
                <BackendForm />
                <BackendList />
              </div>
              <VmList />
            </div>
          </div>
        </Section>
      </div>
    );
  }
}

export default App;
