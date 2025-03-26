
import { Container } from 'react-bootstrap'
import {AuthProvider} from '../contexts/AuthContext'
import 'bootstrap-icons/font/bootstrap-icons.css';
import LogInSignUp from '../pages/LogInSignUp';
import Dashboard from '../pages/Dashboard';
import { CONST_PATH } from './constant';
import { Navigate, useRoutes } from 'react-router-dom';
import Workspace from '../pages/WorkspaceBoard';
import { UserDBProvider } from '../contexts/userDBContext';
import { Amplify } from 'aws-amplify';
import awsExports from '../aws-exports';
import Landing from '../pages/Landing';

Amplify.configure(awsExports);

function App() {

  const routes = useRoutes(
    [
      {
        path: CONST_PATH.landing,   // '/'
        element: <Landing />
      },
      {
        path: CONST_PATH.signInUp,   // '/signup-login'
        element: <LogInSignUp />
      },
      {
        path: CONST_PATH.home,      // '/home'
        element: <Dashboard />,
        children: [
          {
            path: CONST_PATH.workspace.slice(1),   // '/home/workspace', slice(1) remove the '/' from the constant
            element: <Workspace />
          },
          {
            index: true,                                  // Default child route for 'home/worksapce'
            element: <Navigate to={CONST_PATH.workspace.slice(1)} replace />  // Redirect to 'home/workspace'
          },
          {
            path: "*",                                    // default to home/workspace
            element: <Navigate to={CONST_PATH.workspace.slice(1)} replace />
          }
        ]
      }
    ]
  )
  
  return (

    // <Container className="d-flex align-items-center justify-content-center"
    //             style={{
    //                 minHeight: "100vh"
    //               }}>
    <Container className="d-flex" style={{
      margin: 0,
      padding: 0
    }}>
      <AuthProvider>
        <UserDBProvider>
          {routes}
        </UserDBProvider>
      </AuthProvider>
    </Container>

  )
}

export default App
