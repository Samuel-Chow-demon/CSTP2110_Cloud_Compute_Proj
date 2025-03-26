import { Box, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { purple } from '@mui/material/colors'
import { useState } from 'react'

import { useUserContext } from '../contexts/userContext'
import DisplayStream from '../components/DashboardStream'

const Workspace = () => {

  // HardCode the streamID list
  // Simplify the process, suppose there should have
  // stream database management to create and handle the data
  const currentUserOwnedStream = [
    {id:"S1", name : "Stream-ID-S1"},
    {id:"S2", name : "Stream-ID-S2"},
    {id:"S3", name : "Stream-ID-S3"},
    {id:"S4", name : "Stream-ID-S4"},
    {id:"S5", name : "Stream-ID-S5"}
  ]

  // {
  //   username : userName,
  //   userId : userId,
  //   name : preferredUsername
  // }
const currentUser = useUserContext(); // 

const [selectStreamResID, SetSelectStreamResID] = useState("");

const handleSelectStreamChange = (e) => {
  //console.log(e.target.value)
  SetSelectStreamResID(e.target.value);
};

  return (
    <>
      <Box sx={{
          backgroundColor: purple[50],
          width: '100%',
          height: '100%',
          padding: '20px',
          display: "flex",
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start'
        }}>
          
          <Box sx={{
            width: "50%",
            display: "flex",
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '20px',
            paddingBottom: '40px'
          }}>
              <FormControl fullWidth>
                <InputLabel id="select-stream-res">Streams</InputLabel>
                <Select
                    labelId="select-stream-res"
                    id="select-stream"
                    value={selectStreamResID}
                    label="Stream"
                    onChange={handleSelectStreamChange}
                    sx={{
                      backgroundColor: "White"
                    }}
                >
                    {
                        currentUserOwnedStream
                            .map((streamObj, index)=>(
                                <MenuItem key={index} value={streamObj.id}>{streamObj.name}</MenuItem>
                            ))
                    }
                </Select>                       
              </FormControl>

          </Box>

          <DisplayStream accID={currentUser.userId}
                          streamResID={selectStreamResID}
                          expTime={60} />
      </Box>
    </>   
  )
}

export default Workspace