/*global chrome*/
import { Grid } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import React, { useEffect } from 'react';

function App() {
  const [data, setData] = React.useState([]);

  useEffect(() => {
    chrome.storage.local.get(['urls'], result => {
      if(!result.urls)
        return setData([])

      setData(result.urls)
    })
  }, [])

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      sx={{
        width: 650,
        height: 400,
      }}
    >
      <Grid 
        item 
        container 
        justifyContent="center"
      >
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Url</TableCell>
            <TableCell align="right">Sessions</TableCell>
            <TableCell align="right">Total Time</TableCell>
            <TableCell align="right">Average Time</TableCell>
            <TableCell align="right">Last Session Time</TableCell>
            <TableCell align="right">Longest Session Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.url}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{row.url}</TableCell>
              <TableCell align="right">{row.sessions}</TableCell>
              <TableCell align="right">{row.times.totalTime.time}</TableCell>
              <TableCell align="right">{row.times.averageTime.time}</TableCell>
              <TableCell align="right">{row.times.lastSessionTime.time}</TableCell>
              <TableCell align="right">{row.times.longestSessionTime.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </Grid>
    </Grid>
  );
}

export default App;
