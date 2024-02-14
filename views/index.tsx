import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import "./index.css";

const Index = () => {
  useEffect(() => {
    setTimeout(() => {
      ReactDOM.render(
        <React.StrictMode>
        <App />
        </React.StrictMode>,
        document.getElementById('react-ssr-root')
      );
    }, 1);
  }, []);
  return <></>;
};

export default Index;
