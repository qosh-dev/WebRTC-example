import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Room } from './pages/Room';

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" index element={<Room />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};
