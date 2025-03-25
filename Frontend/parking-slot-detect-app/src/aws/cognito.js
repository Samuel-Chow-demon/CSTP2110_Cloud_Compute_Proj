import AWS from "aws-sdk";
import awsconfig from "../aws-exports";

// Initialize AWS SDK Cognito
const cognito = new AWS.CognitoIdentityServiceProvider({

  region: awsconfig.aws_project_region, // us-west-2

  credentials: new AWS.Credentials({
    accessKeyId: import.meta.env.VITE_COGNITO_ACCESS_KEY,      
    secretAccessKey: import.meta.env.VITE_COGNITO_SECRET_ACCESS_KEY,
  }),

});

const userPoolID = awsconfig.aws_user_pools_id

export{
    userPoolID, cognito
};