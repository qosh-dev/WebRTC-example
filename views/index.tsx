import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import adapter from 'webrtc-adapter';
import { Room } from './pages/Room';

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
        console.log('READY', adapter.browserDetails);
        setIsReady(isReady);
        ReactDOM.render(
          <React.StrictMode>
            <Room />
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
