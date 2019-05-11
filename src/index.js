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
import { TitleBar } from "react-desktop/windows";

let titlebar; // Initialize titlebar buffer

let isMaximized; // Initialize maximized buffer

// closeWin closes the window.
const closeWin = () => {
  window.ipcRenderer.sendSync("close_window"); // Close window
};

// minWin minimizes the window.
const minWin = () => {
  window.ipcRenderer.sendSync("min_window"); // Minimize window
};

// maxWin maximizes the window.
const maxWin = () => {
  isMaximized = true; // Is maximized

  window.ipcRenderer.sendSync("max_window"); // Maximize window
};

// restoreWin restores the window.
const restoreWin = () => {
  isMaximized = false; // Is not maximized
  window.ipcRenderer.sendSync("restore_window"); // Restore window
};

if (window.isWindows) {
  // Check is windows
  titlebar = (
    <TitleBar
      title="SummerCash Wallet"
      isMaximized={isMaximized}
      onCloseClick={closeWin}
      onMinimizeClick={minWin}
      onMaximizeClick={maxWin}
      onRestoreDownClick={restoreWin}
      theme="dark"
      controls
    />
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
            color: "white",
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
