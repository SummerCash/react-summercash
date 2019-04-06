import React, { Component } from 'react';
import './SignupLogin.css';
import { Grommet, Heading, Button, Paragraph, Box, Grid } from 'grommet';
import { theme } from './SummerTechTheme'; // Import SummerTech theme

export default class SignupLogin extends Component {
  render() {
    return (
      <Grommet theme={ theme }>
        <Box justify="center" align="center" fill={ true } basis="large">
          <Heading responsive={ true } margin={{ top: "none", bottom: "none" }} size="large">
            SummerCash
          </Heading>

          <Paragraph responsive={ true } size="xxlarge">
            Save, store, and send SummerCash.
          </Paragraph>
          
          <Grid>
            <Button responsive={ true } size="xlarge" label="Create New Wallet" href="signup"/>
            <Button responsive={ true } size="xlarge" margin="small" label="Sign In"/>
          </Grid>
        </Box>
      </Grommet>
    );
  }
}
