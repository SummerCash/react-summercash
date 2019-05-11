import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import AuthForm from "./AuthForm";
import * as serviceWorker from "./serviceWorker";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import { routerReducer } from "react-router-redux";
import { Route, BrowserRouter as Router } from "react-router-dom";
import Faucet from "./Faucet";
import TitleBar from "react-window-titlebar"; // Import TitleBar

let titlebar; // Initialize titlebar buffer

if (window.isWindows) {
  // Check is windows
  titlebar = (
    <TitleBar title="SummerCash Wallet" remote={window.remote} theme="dark" />
  );
} else {
  titlebar = "&nbsp;"; // Set titlebar
}

const store = createStore(
  combineReducers({
    routing: routerReducer
  })
); // Init store

const routing = (
  <Provider store={store}>
    <Router>
      <div>
        <div
          className="drag"
          style={{
            width: "100%",
            height: "10%",
            alignContent: "center",
            alignItems: "center",
            alignSelf: "center",
            position: "absolute",
            top: 0,
            left: 0
          }}
        >
          {titlebar}
        </div>
        <Route exact path="/" component={App} />
        <Route path="/signup" render={() => <AuthForm label="Sign Up" />} />
        <Route path="/login" render={() => <AuthForm label="Log In" />} />
        <Route path="/faucet" render={() => <Faucet />} />
      </div>
    </Router>
  </Provider>
);

ReactDOM.render(routing, document.getElementById("root"));

// Register service worker
serviceWorker.register();
