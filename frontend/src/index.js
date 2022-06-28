import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { MoralisProvider } from "react-moralis";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
    <MoralisProvider appId="ECh7rJk4seHGkjLxzAbSGVdnMl7uAMrF3VsmsFF7" serverUrl="https://vbo917ukbq06.usemoralis.com:2053/server">
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </MoralisProvider>,
  document.getElementById('root')
);