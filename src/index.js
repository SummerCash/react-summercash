import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AuthForm from './AuthForm';
import * as serviceWorker from './serviceWorker';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { routerReducer } from 'react-router-redux';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Faucet from './Faucet';

const store = createStore(
    combineReducers({
        routing: routerReducer,
    })
) // Init store

const routing = (
    <Provider store={store}>
        <Router>
            <div>
                <Route exact path="/" component={ App }/>
                <Route path="/signup" render={ ()=><AuthForm label="Sign Up"/> }/>
                <Route path="/login" render={ ()=><AuthForm label="Log In"/> }/>
                <Route path="/faucet" render={ ()=><Faucet/> }/>
            </div>
        </Router>
    </Provider>
)


ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
