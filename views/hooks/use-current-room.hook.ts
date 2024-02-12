import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const useCurrentRoom = () => {
  // ------------------------------------------------------------------------------
  // variables
  // ------------------------------------------------------------------------------
  const [roomId, setRoomId] = useState<number>();
  const [tempRoomId, setTempRoomId] = useState<number>();

  const navigate = useNavigate();
  const location = useLocation();
  const routerParams = useParams();

  // ------------------------------------------------------------------------------
  // effects
  // ------------------------------------------------------------------------------
  useEffect(() => {
    setRoomId(getCurrentRoom());
    setTempRoomId(getCurrentRoom());
  }, [routerParams]);

  // ------------------------------------------------------------------------------
  // functions
  // ------------------------------------------------------------------------------

  function getCurrentRoom() {
    const url = new URL(document.location.href);
    for (const key of Array.from(url.searchParams.keys())) {
      if (key === 'roomId') {
        const value = url.searchParams.get(key);
        if (!value) {
          return 1;
        }
        return +value;
      }
    }

    return 1;
  }

  function openRoom() {
    const params = new URLSearchParams({ roomId: String(tempRoomId) });
    const to = { pathname: location.pathname, search: params.toString() };
    navigate(to, { replace: true });
    window.location.reload();// TODO: use other method
  }

  return {
    roomId,
    tempRoomId,
    setRoomId: setTempRoomId,
    openRoom
  };
};
