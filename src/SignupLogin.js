import React, { Component } from 'react';
import './SignupLogin.css';
import { Grommet, Heading, Button, Paragraph, Box, Grid } from 'grommet';
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import Cookies from 'universal-cookie'; // Import cookies
import { withRouter } from 'react-router-dom'; // Import router

class SignupLogin extends Component {
  // construct a new App component instance
  constructor(props) {
    super(props); // Super props

    const cookies = new Cookies(); // Initialize cookies
  
    if (cookies.get("username") !== undefined && cookies.get("username") !== "" && cookies.get("username") !== "not-signed-in") { // Check already signed in
      fetch("/api/accounts/"+cookies.get("username")+"/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: cookies.get("password"),
        })
      }).then((response) => response.json())
      .then(response => {
        cookies.set('address', response.address); // Set address
  
        this.setState({
          username: cookies.get('username') || 'not-signed-in', // Set username cookie
          password: cookies.get('password') || 'not-signed-in', // Set password
          address: cookies.get('address') || 'not-signed-in', // Set address
        }) // Set state
      })
    }

    this.onClickLogin = this.onClickLogin.bind(this); // Bind this
  }

  render() {
    if (this.state !== undefined && this.state !== null && this.state.username !== "" && this.state.username !== "not-signed-in" && this.state.address !== "" && this.address !== "not-signed-in") { // Check signed in
      this.props.history.push("/"); // Go to app
    }

    return (
      <Grommet theme={ theme } full={ true }>
        <Box justify="center" align="center" fill={ true } basis="large">
          <Heading responsive={ true } margin={{ top: "none", bottom: "none" }} size="large">
            SummerCash
          </Heading>

          <Paragraph responsive={ true } size="xxlarge" textAlign="center">
            Save, store, and send SummerCash.
          </Paragraph>
          
          <Grid>
            <Button responsive={ true } size="xlarge" primary color="accent-2" label="Create New Wallet" href="signup"/>
            <Button responsive={ true } size="xlarge" margin="small" label="Sign In" onClick={ this.onClickLogin }/>
          </Grid>
        </Box>
      </Grommet>
    );
  }

  // onClickLogin handles the login event.
  onClickLogin (event) {
    this.props.history.push("/login"); // Go to login
  }
}

export default withRouter(SignupLogin); // Force use router