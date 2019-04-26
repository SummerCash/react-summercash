import React, { Component } from 'react'; // Import react
import './SignupLogin.css'; // Import CSS
import { Grommet, Box, Heading, Paragraph, Button } from 'grommet'; // Import grommet
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { ToastContainer, toast } from 'react-toastify'; // Import toast notification
import Cookies from 'universal-cookie'; // Import cookies

export default class Faucet extends Component {
  errorAlert = (message) => toast.error(message); // Alert
  infoAlert = (message) => toast.info(message); // Alert
  successAlert = (message) => toast.success(message); // Alert

  constructor(props) {
    super(props); // Super

    this.state = {
      timeUntilClaim: "", // Set time until claim
      nextClaimAmount: 0, // Set claim amount
    }; // Set state
  }

  componentDidMount() {
    this.getClaimAmount(); // Get claim amount

    window.setInterval(() => {
      this.getTimeUntilClaim(); // Refresh claim time
    }, 1000); // Sync every second
  }

  render() {
    return (
      <Grommet theme={ theme } full>
        <ToastContainer/>
        <Box align="center" fill="vertical" justify="center" basis="large">
          <Heading margin={{ bottom: "none" }}>Faucet</Heading>
          <Heading size="xlarge" margin={{ top: "small", bottom: "none" }}>{ this.state.timeUntilClaim }</Heading>
          <Paragraph size="large" margin={{ top: "small" }}>Time Until Next Claim</Paragraph>
          <Button responsive={ true } size="xlarge" primary color="accent-2" label={ this.getClaimLabelText() }/>
        </Box>
      </Grommet>
    )
  }

  async getTimeUntilClaim() {
    const cookies = new Cookies(); // Initialize cookies

    await fetch("/api/faucet/"+cookies.get("username")+"/NextClaimTime", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert

        return; // Return
      }

      this.setState({ timeUntilClaim: response.time }); // Set time until claim
    });
  }

  async getClaimAmount() {
    const cookies = new Cookies(); // Initialize cookies

    await fetch("/api/faucet/"+cookies.get("username")+"/NextClaimAmount", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert

        return; // Return
      }

      this.setState({ nextClaimAmount: response.amount }); // Set claim amount
    });
  }

  // getClaimLabel gets the claim label text.
  getClaimLabelText() {
    return `Claim ${ this.state.nextClaimAmount } SummerCash`; // Return text
  }
}
