import React, { Component } from "react";
import "font-awesome/css/font-awesome.css";
import "./App.css";
import "bulma/css/bulma.css";
import Header from "./components/header";
import BackendList from "./components/backend-list";
import StartForm from "./components/start-form";
import VmList from "./components/vm-list";
import Section from "react-bulma-components/lib/components/section";
import { GoogleLogin } from "react-google-login";
import { url } from "./helpers";
import axios from "axios";

class App extends Component {
  constructor() {
    super();
    let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.state = { isAuthenticated: true, user: user };
    } else {
      this.state = { isAuthenticated: false, user: null };
    }
  }

  logout = () => {
    localStorage.removeItem("user");
    this.setState({ isAuthenticated: false, user: null });
  };

  googleResponse = (response) => {
    axios
      .post(`${url}auth/google`, { access_token: response.accessToken })
      .then((res) => {
        console.log(res);
        const token = res.data.token;
        if (token) {
          var user = res.data.user;
          user.token = token;
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem("user", JSON.stringify(user));
          this.setState({
            isAuthenticated: true,
            user: res.data,
            token,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  onFailure = (error) => {
    alert(error);
  };

  render() {
    let content = (
      <div className="App">
        <Header />
        <Section>
          <button onClick={this.logout} className="button">
            Log out
          </button>
          <div className="container">
            <div className="columns">
              <div className="column">
                <StartForm />
              </div>
              <div className="column">
                <h3 className="title is-3">Backends</h3>
                <BackendList />
              </div>
            </div>

            <VmList />
          </div>
        </Section>
      </div>
    );

    let login = (
      <div className="App">
        <Header />
        <Section>
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login"
            onSuccess={this.googleResponse}
            onFailure={this.onFailure}
          />
        </Section>
      </div>
    );
    if (!!this.state.isAuthenticated) {
      return content;
    } else {
      return login;
    }
  }
}

export default App;
