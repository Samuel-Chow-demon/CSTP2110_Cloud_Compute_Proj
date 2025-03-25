import AWS from "aws-sdk";
import awsconfig from "../aws-exports";

const lambda_exe = new AWS.Lambda({
    accessKeyId: import.meta.env.VITE_LAMBDA_EXE_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_LAMBDA_EXE_SECRET_ACCESS_KEY,
    region: awsconfig.aws_project_region // us-west-2
});

export{
    lambda_exe
}