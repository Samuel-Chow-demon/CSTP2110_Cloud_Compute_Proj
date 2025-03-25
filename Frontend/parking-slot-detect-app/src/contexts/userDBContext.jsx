import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext.jsx';
import {ALERT_SUCCESS_COLOR, ALERT_ERROR_COLOR} from '../components/constant.js'
import {lambda_exe} from '../aws/lambda.js'

const userDBContext = createContext()

const useUserDB = ()=>useContext(userDBContext)

const UserDBProvider = ({children})=>{

    const [isLoadingUserDB, SetIsLoadingUserDB] = useState(false)
    const [currentUserAtDB, setCurrentUserToDB] = useState(null)
    const [alertUserDB, setAlertUserDB] = useState({});

    const {registerCurrentUser} = useAuth()

    const invokeLambdaToDynamoDBFunc = async () => {

        try {

            const payLoadObj = {
                "email": currentUserAtDB.email,
                "username": currentUserAtDB.username,
                "userId": currentUserAtDB.userId
              }

            const params = {
                FunctionName: import.meta.env.VITE_LAMBDA_EXE_ARN,  // ARN of Lambda function
                InvocationType: 'RequestResponse',  // This ensures synchronous invocation
                Payload: JSON.stringify(payLoadObj),
            };
        
            // Invoke the Lambda function
            const response = await lambda_exe.invoke(params).promise();

            console.log("response", response)
        
            // The object return from python Lambda will be in the response.Payload body
            const payload = JSON.parse(response.Payload);

            //console.log('Lambda payload:', payload);

            const body = JSON.parse(payload.body)
            
            console.log('Lambda body:', body);
            
            // Check if the status is not 200
            if (response.StatusCode !== 200) 
            {
                const errorMsg = `Lambda function failed: ${response.Payload}`
                console.error('Lambda function failed:', response.Payload);
                throw errorMsg
            }
        } 
        catch (error) 
        {
            const errorMsg = `Error execute Lambda: ${error}`
            console.error(errorMsg);
            throw errorMsg
        }
    };

    // Run Once when currentUserID changes
    useEffect(()=>{

        const loadUserDB = async()=>{

            if (currentUserAtDB && isLoadingUserDB)
            {
                console.log("currentUserAtDB", currentUserAtDB)
                
                try
                {
                    // here call the lambda to add user to DynamoDb and await finish
                    await invokeLambdaToDynamoDBFunc()

                    // if not error set to current User
                    registerCurrentUser(currentUserAtDB)

                    setAlertUserDB({...alertUserDB, message:`Success Added New User`, color: ALERT_SUCCESS_COLOR, isOpen: true, hideDuration: 1500 });
                }
                catch(error)
                {
                    setAlertUserDB({...alertUserDB, message:error, color: ALERT_ERROR_COLOR, isOpen: true, hideDuration: 1500 });
                }
                
                SetIsLoadingUserDB(false)
            }
        }

        loadUserDB();

    }, [currentUserAtDB])

    useEffect(()=>{
        setAlertUserDB({...alertUserDB, message:'', isOpen: false });
    }, []);

    return(
        <userDBContext.Provider value = {{
            setCurrentUserToDB, alertUserDB,
            isLoadingUserDB, SetIsLoadingUserDB
        }}>
            {children}
        </userDBContext.Provider>
    )
}

export{useUserDB, UserDBProvider}