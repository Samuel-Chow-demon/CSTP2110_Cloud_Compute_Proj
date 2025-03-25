import {createContext, useEffect, useState, useContext} from 'react'
import { signUp as awsSignUp, confirmSignUp, signOut, signIn, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import {userPoolID, cognito} from '../aws/cognito';

const AuthContext = createContext();

const useAuth = ()=>{
    return useContext(AuthContext);
}

const AuthProvider = ({children}) => {

    const[currentUser, setCurrentUser] = useState(null);
    const[currentPendingUser, setCurrentPendingUser] = useState(null);

    const[isLoadingUser, setIsLoadingUser] = useState(false);

    const signUp = async (userName, email, password, setMsgObj)=>{
        try
        {
            setIsLoadingUser(true);
            unregisterCurrentUser();

            // Here await amplify auth signup first step
            try {
                const {isSignUpComplete, nextStep} = await awsSignUp({
                    username: email,  // Required unique identifier
                    password,
                    options:{
                        userAttributes: {
                            email,
                            "custom:preferred_username": userName,  // Store username in Cognito's built-in attribute
                        },
                    }
                });

                console.log("Signup Response:", nextStep);

                // Then after success signup pending, here set the pending user as a trigger for SignUp Page to prompt
                // for input the email code confirmation

                setCurrentPendingUser({
                    email : email,
                    displayEmail : nextStep.codeDeliveryDetails.destination,
                    username : userName,
                    password: password,
                    userId : ""
                });
            } 
            catch (error) 
            {
                setMsgObj({msg : `Account Creation Fail - ${error.message}`, color : "danger", needSpinner : false});
                console.error("Signup error:", error);
            }
            setIsLoadingUser(false);
        }
        catch(error)
        {
            unregisterCurrentUser();
            setIsLoadingUser(false);
            throw error;
        }
    }

    const signUpConfirm = async (email, code, setMsgObj, setDialogOpen)=>{
        try
        {
            setIsLoadingUser(true);

            //console.log("email - 1", email)
            //console.log("code - 1", code)

            // Here await amplify auth signup confirm
            try {

                const response = await confirmSignUp({
                    username : email,
                    confirmationCode : code
                });

                console.log("Email Confirmation Response:", response);

                // Test sign IN
                await signIn({ 
                    username : email,
                    password : currentPendingUser.password
                });

                const { userId } = await getCurrentUser();

                // Revert to signout
                await signOut();

                // Then after success signup confirm here register the current pending user to current User
                // for trigger signup page on waiting the cognito post confirmation from DyanmoDB
                setCurrentUser({
                    ...currentPendingUser,
                    userId : userId
                })
            } 
            catch (error) 
            {
                await deleteUnconfirmedUser(currentPendingUser, setMsgObj)
                setMsgObj({msg : `Confirmation Fail - ${error.message}`, color : "danger", needSpinner : false});
                console.error("Confirmation error:", error);
            }

            setIsLoadingUser(false);
            setDialogOpen(false)
        }
        catch(error)
        {
            unregisterCurrentUser();
            setIsLoadingUser(false);
            throw error;
        }
    }

    
    const deleteUnconfirmedUser = async (pendingUser, setMsgObj) => 
    {
        setIsLoadingUser(true);

        try {

            const params = {
                UserPoolId: userPoolID,
                Username: pendingUser.email,     // The email of the user
            };
      
            // AdminDeleteUser able to access and delete the user
            await cognito.adminDeleteUser(params).promise();

            console.log(`User with username ${params.Username} deleted successfully.`);

            setMsgObj({msg : `Cancelled Account Creation`, color : "secondary", needSpinner : false});

        } 
        catch (error) 
        {
            setMsgObj({msg : `Remove Pending Account Fail - ${error.message}`, color : "danger", needSpinner : false});
            console.error("Error deleting user:", error);
        }

        unregisterCurrentUser();
        setIsLoadingUser(false);
      };

    const logIn = async (email, password, setMsgObj)=>{
        try
        {
            setIsLoadingUser(true);
            unregisterCurrentUser();

            // Here call the amplify auth LogIn
            const { isSignedIn, nextStep } = await signIn({ 
                username : email,
                password
            });

            // When no error, call to get the current user
            const { userId, signInDetails, attributes } = await getCurrentUser();

            const userAttributes = await fetchUserAttributes();

             // Get preferred username
            const userName = signInDetails.loginId
            const preferredUsername = userAttributes["custom:preferred_username"]

             console.log(`The username: ${userName}`);
             console.log(`The perferred Name: ${preferredUsername}`);
             console.log(`The userId: ${userId}`);

            setCurrentUser({
                username : userName,
                userId : userId,
                name : preferredUsername
            });

            setIsLoadingUser(false);
        }
        catch(error)
        {
            console.log(error.message)
            unregisterCurrentUser();
            setIsLoadingUser(false);
            throw error
        }
    }

    const signOutHandle = async ()=>{
        try
        {
            setIsLoadingUser(true);

            // Here call the cognito SignOut
            await signOut();
            
            //unregister current user
            unregisterCurrentUser();
            setIsLoadingUser(false);
        }
        catch(error)
        {
            unregisterCurrentUser();
            setIsLoadingUser(false);
            throw error
        }
    }

    const setToLocalStorage = (user)=>{
        const data = {
            uid : user.uid,
            userName : user.UserName,
            accessToken : user.accessToken
        }
        localStorage.clear()
        localStorage.setItem("userData", JSON.stringify(data))
    }

    const getLocalStorage = ()=>{
        return JSON.parse(getItem("userData"))
    }

    const registerCurrentUser = (user)=>{
        setCurrentUser(user)
        
        setToLocalStorage(user)
        

    }
    const unregisterCurrentUser = ()=>{
        setCurrentUser(null)
        setCurrentPendingUser(null)
        localStorage.clear()
    }

    const value = {
        currentUser, isLoadingUser,
        currentPendingUser, setCurrentPendingUser,
        getLocalStorage, registerCurrentUser, unregisterCurrentUser,
        signUp, signUpConfirm, logIn, signOutHandle, deleteUnconfirmedUser
    }

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
}

export {AuthProvider, useAuth}