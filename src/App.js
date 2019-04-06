import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import SignupLogin from './SignupLogin'; // Import signup login page
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Heading, Paragraph, Box } from 'grommet';
import Blockies from 'react-blockies'; // Import identicons
import TransactionView from './TransactionView'; // Import tx view

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
        <Box margin={{ top: "medium", left: "medium" }} align="center" direction="row-responsive">
          <Blockies seed={ this.state.address } size={ 5 } scale={ 15 } className="blocky"/>
          <Box margin={{ left: "medium" }}>
            <Heading responsive={ true } size="medium" margin="none">
              { this.state.username }
            </Heading>
            <Paragraph responsive={ true } size="large" margin={{ top: "xsmall" }}>
              { this.state.address }
            </Paragraph>
          </Box>
        </Box>
        <Heading responsive={ true } size="medium" margin={{ left: "medium", top: "large"}}>
          Transactions
        </Heading>
        <TransactionView margin="medium" gap="large" type="send" timestamp="3:10 PM" hash="0x123456" amount={ 1000000 }/>
      </Grommet>
    );
  }
}

export default App;
