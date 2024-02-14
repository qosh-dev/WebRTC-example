import { useState } from 'react';
import { Button } from '../atoms/Button';

export const VideoControls = ({
  isScreenShared,
  onScreenShare,
  onToggleFullscreen
}: {
  isScreenShared: boolean;
  onScreenShare: (v: boolean) => void;
  onToggleFullscreen: (v: boolean) => void;
}) => {
  // --------------------------------------------------------------------
  // Variables
  // --------------------------------------------------------------------
  
  const [isFullscreen, setFullscreen] = useState(false);

  // --------------------------------------------------------------------
  // Functions
  // --------------------------------------------------------------------

  const handleToggleFullscreen = () => {
    const value = !isFullscreen;
    setFullscreen(value);
    onToggleFullscreen(value);
  };

  const onClickSwitchSharingBtn = () => {
    onScreenShare(!isScreenShared);
  };

  // --------------------------------------------------------------------
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <div>
        <Button onClick={onClickSwitchSharingBtn}>
          {isScreenShared ? 'Cancel Sharing' : 'Share Screen'}
        </Button>
        <Button onClick={handleToggleFullscreen}>
          {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </Button>
      </div>
    </div>
  );
};
