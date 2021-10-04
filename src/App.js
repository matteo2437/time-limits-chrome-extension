/*global chrome*/
import { Grid } from '@mui/material';
import Button from '@mui/material/Button';

function App() {
  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      sx={{
        width: 200,
        height: 400,
      }}
    >
      <Grid 
        item 
        container 
        justifyContent="center"
      >
        <Button
          onClick={() => {
            chrome.tabs.query({currentWindow: true, active: true}, tabs => {
              chrome.tabs.sendMessage(tabs[0].id, tabs[0].url)
            })
          }}
        >
          test
        </Button>
      </Grid>
    </Grid>
  );
}

export default App;
