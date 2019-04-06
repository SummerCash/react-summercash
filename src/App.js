import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import SignupLogin from './SignupLogin'; // Import signup login page
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Heading, Button, Paragraph, Box, Grid } from 'grommet';
import Blockies from 'react-blockies'; // Import identicons

class App extends Component {
  // construct a new App component instance
  constructor(props) {
    super(props); // Super props

    const cookies = new Cookies(); // Initialize cookies
  
    this.state = {
      username: cookies.get('username') || 'not-signed-in', // Get username cookie
      address: cookies.get('address') || 'not-signed-in', // Get address cookie
    } // Set state
  }

  // render
  render() {
    if (this.state.username === 'not-signed-in' || this.state.username === '') { // Check not signed in
      return <SignupLogin /> // Render signup/login page
    }

    return (
      <Grommet theme={ theme }>
        <Box align="start" basis="large" margin={{ top: "small", left: "small" }}>
          <Blockies seed={ this.state.address } size={ 5 } scale={ 15 } className="blocky"/>
          <Heading responsive={ true } size="medium" margin={{ top: "none", bottom: "none" }}>
            { this.state.username }
          </Heading>
          <Paragraph responsive={ true } size="large" margin={{ top: "xsmall" }}>
            { this.state.address }
          </Paragraph>
        </Box>
      </Grommet>
    );
  }
}

export default App;
