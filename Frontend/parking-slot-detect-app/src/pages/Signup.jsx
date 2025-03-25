import { memo, useEffect, useRef, useState, Fragment } from 'react'
import { Form, Button, Card, Container, InputGroup } from 'react-bootstrap'
import {useAuth} from '../contexts/AuthContext.jsx'
import checkPasswordRule from '../utilities/passwordRule.js'
import AlertDisplay from '../utilities/AlertDisplay.jsx'
import { useUserDB } from '../contexts/userDBContext.jsx'

import Draggable from 'react-draggable';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Box, DialogTitle, Paper, TextField, Typography } from '@mui/material'
import { grey, purple } from '@mui/material/colors'
import { ALERT_SUCCESS_COLOR } from '../components/constant.js'

const Signup = ({changeToLogInTab}) => {

    const userNameRef = useRef("");
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const passwordConfirmRef = useRef("");
    const emailConfirmCodeRef = useRef("");

    const {signUp, signUpConfirm, deleteUnconfirmedUser,
            unregisterCurrentUser,
            currentPendingUser, setCurrentPendingUser,
            currentUser, isLoadingUser} = useAuth();

    const {setCurrentUserToDB,
            isLoadingUserDB, SetIsLoadingUserDB,
            alertUserDB} = useUserDB();

    const [isStartSignUp, setStartSignUp] = useState(false);

    const [messageObj, setMessageObj] = useState({
        msg : "",
        color : "dark",
        needSpinner : false
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isDisplayConfirmIcon, setDisplayConfirmIcon] = useState(false);
    const [isPSConfirmOK, setIsPSConfirmOK] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [openProceedYesNoDialog, setOpenProceedYesNoDialog] = useState(false);


    const DEFAULT_FORM_GROUP_SPACE = "mb-4";

    useEffect(()=>{

        if (currentPendingUser)
        {
            //console.log("pending", currentPendingUser)
            // Open confirm user dialog
            setOpenConfirmDialog(true)
        }

    }, [currentPendingUser])

    useEffect(()=>{
        if (isStartSignUp &&
            currentUser &&
            !isLoadingUser) // means finished
        {
            console.log("SignUp - ", currentUser)
            SetIsLoadingUserDB(true)
            setCurrentUserToDB(currentUser)
        }
    }, [currentUser, isLoadingUser]);

    useEffect(()=>{

        const checkAndWaitSignUpSuccess = async()=>{

            // If trigger SignUp and finished loading User DB
            if (isStartSignUp &&
                currentUser && 
                !isLoadingUserDB)
            {
                if (alertUserDB.color === ALERT_SUCCESS_COLOR)
                {
                    clearAllFieldSet();
                    setMessageObj({msg : "Create User Success", color : "success", needSpinner : false});
    
                    setTimeout(()=>{
                        changeToLogInTab()
                    }, 1500);
                }
                else
                {
                    await deleteUnconfirmedUser(currentPendingUser, setMessageObj)
                    unregisterCurrentUser()
                    setMessageObj({msg : `Account DB Creation Fail - ${alertUserDB.message}`, color : "danger", needSpinner : false});
                }
    
                setCurrentPendingUser(null)
                setStartSignUp(false);
            }
        }

        checkAndWaitSignUpSuccess();

    }, [isLoadingUserDB])

    const proceedEmailConfirm = async()=>{
        const email = currentPendingUser.email
        const code = emailConfirmCodeRef.current.value

        //console.log("email", email)
        //console.log("code", code)
        
        await signUpConfirm(email, code, setMessageObj, setOpenConfirmDialog)
    }

    const proceedCancelEmailConfirm = async()=>{

        await deleteUnconfirmedUser(currentPendingUser, setMessageObj)

        unregisterCurrentUser()
        setOpenProceedYesNoDialog(false)
        setOpenConfirmDialog(false)
    }

    const ActionConfirmComponent = memo(()=>(

        <Box sx={{
            width: "100%",
            display:'flex',
            justifyContent:'space-around',
            alignItems:'center',
            border:'none',
            padding:'2px', gap:2}}
        >
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:purple[500]
                    }
                }} 
                onClick={proceedEmailConfirm}>Confirm</Button>
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:grey[600]
                    }
                }}
                onClick={()=>setOpenProceedYesNoDialog(true)}>
                Cancel
            </Button>
        </Box>
    ));

    const ActionCancelComponent = memo(()=>(

        <Box sx={{
            width: "100%",
            display:'flex',
            justifyContent:'space-around',
            alignItems:'center',
            border:'none',
            padding:'2px', gap:2}}
        >
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:purple[500]
                    }
                }} 
                onClick={proceedCancelEmailConfirm}>Yes</Button>
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:grey[600]
                    }
                }}
                onClick={()=>setOpenProceedYesNoDialog(false)}>
                No
            </Button>
        </Box>
    ));

    const PaperComponent = memo(({ nodeRef, ...props }) => {
        return (
          <Draggable nodeRef={nodeRef}
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
          >
            <Paper ref={nodeRef} sx={{ borderRadius: '8px' }} {...props} />
          </Draggable>
        );
      });

    const CancelConfirmEmailDialog = memo(() => {

        const dialogNodeRef = useRef(null);
    
        return (
            <Fragment>
                <Dialog
                    open={openProceedYesNoDialog}
                    onClose={()=>setOpenProceedYesNoDialog(false)}
                    PaperComponent={(props) => (
                        <PaperComponent {...props} nodeRef={dialogNodeRef} />
                    )}
                    aria-labelledby="draggable-dialog-title"
                >
                    <DialogTitle style={{ cursor: 'move', textAlign: 'center' }}
                                 sx={{color:purple[800]}}
                                 id="draggable-dialog-title">
                        Sure Cancel Registration ?
                    </DialogTitle>
                    <DialogContent>
                        <Paper style={{
                            height: '100%',
                            display: 'flex',
                            marginTop: '10px',
                            flexDirection: 'column', gap: '20px',
                            justifyContent: 'center', alignItems: 'center'
                        }}
                            elevation={0}>

                        <ActionCancelComponent/>     
    
                        </Paper>
                    </DialogContent>
                </Dialog>
            </Fragment >
        );
    });

    const ConfirmEmailDialog = memo(() => {

        const dialogNodeRef = useRef(null);
    
        return (
            <Fragment>
                <Dialog
                    open={openConfirmDialog}
                    onClose={()=>setOpenConfirmDialog(false)}
                    PaperComponent={(props) => (
                        <PaperComponent {...props} nodeRef={dialogNodeRef} />
                    )}
                    aria-labelledby="draggable-dialog-title"
                >
                    <DialogTitle style={{ cursor: 'move', textAlign: 'center' }}
                                 sx={{color:purple[800]}}
                                 id="draggable-dialog-title">
                        Email Confirmation
                    </DialogTitle>
                    <DialogContent>
                        <Paper style={{
                            height: '100%',
                            display: 'flex',
                            marginTop: '10px',
                            flexDirection: 'column', gap: '20px',
                            justifyContent: 'center', alignItems: 'center'
                        }}
                            elevation={0}>
    
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '5px'
                        }}>

                            {
                                currentPendingUser &&
                                <>
                                    <Typography>Confirmation code send to : {currentPendingUser.displayEmail}</Typography>

                                    <TextField
                                        fullWidth
                                        required
                                        autoFocus
                                        label="Confirmation Code"
                                        variant="outlined"
                                        inputRef={emailConfirmCodeRef}
                                    />

                                    <ActionConfirmComponent/>
                                </>
                            }
                            
                        </Box>
                            
    
                        </Paper>
                    </DialogContent>
                </Dialog>
            </Fragment >
        );
    });

    const clearAllMessage = ()=>{
        setMessageObj({...messageObj, msg:""});
        setErrorMessage("");
    }

    const clearAllFieldSet = ()=>{
         userNameRef.current.value = "";
         emailRef.current.value = "";
         passwordRef.current.value = "";
         passwordConfirmRef.current.value = "";
         setDisplayConfirmIcon(false);
    }

    const applyErrorMessage = (message)=>{
        // Any error shall clear the password entry
        passwordConfirmRef.current.value = "";
        passwordRef.current.value = "";
        setErrorMessage(message);
    }

    const checkAndDisplayMessage = ()=>{

        const msg = (errorMessage || messageObj.msg);
        const color = errorMessage !== "" ? "danger" : messageObj.color;
        const spinnerAttrib = {
            display: errorMessage !== "" ? false : messageObj.needSpinner
        };

        return (
            msg &&
            AlertDisplay(msg, color, 0, 4, spinnerAttrib)
        )
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();

        const checkPSMsg = checkPasswordRule(passwordRef.current.value);
        if (checkPSMsg)
        {
            return applyErrorMessage(checkPSMsg);
        }

        if (passwordConfirmRef.current.value !== passwordRef.current.value)
        {
            return applyErrorMessage("Confirm Password Do Not Match");
        }

        try{
            clearAllMessage();
            setMessageObj({msg : "Creating User. . .", color : "secondary", needSpinner : true});
            unregisterCurrentUser();
            setStartSignUp(true);

            // Would auto update the currentUser under the subscription in the AuthContext
            await signUp(userNameRef.current.value,
                         emailRef.current.value,
                         passwordRef.current.value,
                         setMessageObj);
        }
        catch(error)
        {
            setStartSignUp(false);
            console.log(`SignUp Error : ${error.message}`)
            applyErrorMessage(`Account Creation Fail :\n ${error.code}`);
        }
    }

    const checkConfirmPasswordOnChange = (e)=>{

        setDisplayConfirmIcon(passwordConfirmRef.current.value !== "");
        if (passwordConfirmRef.current.value !== "" &&
            passwordRef.current.value != "")
        {
            setIsPSConfirmOK(passwordConfirmRef.current.value === passwordRef.current.value);
        }
    }

  return (
    <>
        <ConfirmEmailDialog />
        <CancelConfirmEmailDialog sx={{ zIndex: 99 }}/>
        <Card style={{border: "none"}}>
            <Card.Body>
                <h2 className="text-center mb-10 fs-1" style={{
                    color : "#71207d"
                }}>Sign Up</h2>
                {
                    checkAndDisplayMessage()
                }
                <Form onSubmit={handleSubmit}>

                    <fieldset disabled={isLoadingUser || isLoadingUserDB} onChange={clearAllMessage}>
                           
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="userName">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="name" ref={userNameRef} required />
                        </Form.Group>
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="password">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <Form.Control type={showPassword ? "text" : "password"} ref={passwordRef} 
                                                placeholder='Enter Password' autoComplete="off" onChange={checkConfirmPasswordOnChange} required/>
                                <Button variant="outline-secondary" onClick={()=>{setShowPassword((prev)=> !prev)}}
                                    style={{
                                        borderColor: "#c7cad1"
                                    }}>
                                <i className = {`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                                </Button>
                            
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className = {`${DEFAULT_FORM_GROUP_SPACE}`} id="password-confirm">
                            <Form.Label>Password Confirmation</Form.Label>
                            <Container className="d-flex justify-content-between align-items-center p-0">
                                <InputGroup style={{width: isDisplayConfirmIcon ? "90%" : "100%"}}>
                                    <Form.Control type={showConfirmPassword ? "text" : "password"} ref={passwordConfirmRef} autoComplete="off" required 
                                        placeholder="Enter Password Again" onChange={checkConfirmPasswordOnChange}/>
                                    <Button variant="outline-secondary" onClick={()=>{setShowConfirmPassword((prev)=> !prev)}}
                                        style={{
                                            borderColor: "#c7cad1"
                                        }}>
                                        <i className = {`bi bi-eye${showConfirmPassword ? "-slash" : ""}`}></i>
                                    </Button>
                                
                                </InputGroup>
                                    {
                                        isDisplayConfirmIcon &&
                                        <i className={`bi bi-${isPSConfirmOK ? "check" : "x"}-lg`} style={{
                                            fontSize: "2rem",
                                            color: isPSConfirmOK ? "#4bbf5e" : "#de5082"
                                        }}></i>
                                    }
                            </Container>

                        </Form.Group>
                        <Button className="w-100 text-center mt-2" type="submit" style={{
                            backgroundColor : "#a031b0",
                            border : "none"
                        }}>
                            Sign Up
                        </Button>
                    </fieldset>
                </Form>
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Already have an account ? <a href="#" className="link-underline-primary" onClick={changeToLogInTab}>Log In</a>
        </div>
    </>
  )
}

export default Signup;