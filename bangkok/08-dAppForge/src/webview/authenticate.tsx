import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import styles from './index.module.css'
import { useAuthentication } from './hooks'


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Authentication = () => {
  const {
    completed,
    user,
    authenticate,
    logout
  } = useAuthentication()


  if (!completed) {
    return <div>Loading...</div>; // Display a loading indicator while checking authentication
  } else {
    return (
      <div>
        {user ? (
          <>
            {user.avatarUrl && (
              <div>
                <img
                  src={user.avatarUrl}
                  alt={`${user.fullName}'s GitHub avatar`}
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
              </div>
            )}
            <div>GitHub ID: {user.id}</div>
            <div>Name: {user.fullName}</div>
            <div>Email: {user.email}</div>
            <div>Tokens: {user.tokenCount}</div>
            <VSCodeButton
              className={styles.authenticateButton}
              onClick={logout}
            >
              Logout
            </VSCodeButton>
          </>
        ) : (
          <VSCodeButton
            className={styles.authenticateButton}
            onClick={authenticate}
          >
            Login with GitHub
          </VSCodeButton>
        )}
      </div>
    );
  }
}