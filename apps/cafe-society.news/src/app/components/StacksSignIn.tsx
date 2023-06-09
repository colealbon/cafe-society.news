// import { AppConfig, UserSession } from '@stacks/connect';
import { FunctionComponent } from 'react';
import { Button, Typography } from '@mui/material';
import { useStorage } from '../react-hooks/useStorage';
import { showConnect } from '@stacks/connect';
// const appConfig = new AppConfig(['store_write', 'publish_data']);
// const userSession: UserSession = new UserSession({ appConfig });

const StacksSignin: FunctionComponent = () => {
  const { userSession } = useStorage();

  const authenticate = () => {
    showConnect({
      appDetails: {
        name: 'cafe-society',
        icon: 'https://cafe-society.news/logo192.png',
      },
      redirectTo: '/',
      onFinish: () => {
        userSession.loadUserData();
        window.location.reload();
      },
      userSession: userSession,
    });
  };

  return (
    <>
      {[userSession.isUserSignedIn()]
        .filter((signedIn) => !signedIn)
        .map(() => {
          return (
            <Button key="blockstacksignin" onClick={() => authenticate()}>
              <Typography>sign in</Typography>
            </Button>
          );
        })}
    </>
  );
};

export default StacksSignin;
