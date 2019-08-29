import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import "./libs/css/font-awesome-4.7.0/css/font-awesome.css"
import "antd/dist/antd.css"
import Home from "./Container/Home"
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Home />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
