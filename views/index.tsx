import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Room } from './pages/Room';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Index = () => {
  // --------------------------------------------------------------------
  // Variables
  // --------------------------------------------------------------------

  const [isReady, setIsReady] = useState(false);

  // --------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------

  useEffect(() => {
    setTimeout(() => {
      if (window) {
        setIsReady(isReady);
        ReactDOM.render(
          <React.StrictMode>
            <BrowserRouter>
              <Routes >
                <Route   path="/" index element={<Room />} />
              </Routes>
            </BrowserRouter>
          </React.StrictMode>,
          document.getElementById('react-ssr-root')
        );
      } else {
        console.log('window not DEFINED');
      }
    }, 100);
  }, [isReady]);

  if (!isReady) return <>NOT READY</>;
};

export default Index;
