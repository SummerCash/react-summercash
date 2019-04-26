import React, { Component } from 'react'; // Import react
import './SignupLogin.css'; // Import CSS
import { Grommet, Box, Heading, Paragraph, Button } from 'grommet'; // Import grommet
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { ToastContainer, toast } from 'react-toastify'; // Import toast notification
import Cookies from 'universal-cookie'; // Import cookies
import { withRouter } from 'react-router-dom'; // Import router

class Faucet extends Component {
  errorAlert = (message) => toast.error(message); // Alert
  infoAlert = (message) => toast.info(message); // Alert
  successAlert = (message) => toast.success(message); // Alert

  constructor(props) {
    super(props); // Super

    const cookies = new Cookies(); // Initialize cookies

    this.state = {
      timeUntilClaim: "", // Set time until claim
      nextClaimAmount: 0, // Set claim amount
      username: cookies.get("username"), // Set username
    }; // Set state

    this.getTimeUntilClaim = this.getTimeUntilClaim.bind(this); // Bind this
    this.getClaimAmount = this.getClaimAmount.bind(this); // Bind this
    this.makeClaim = this.makeClaim.bind(this); // Bind this
  }

  componentDidMount() {
    const cookies = new Cookies(); // Initialize cookies

    if (cookies.get("username") === undefined || cookies.get("username") === "not-signed-in") { // Check not signed in
      this.props.history.push("/"); // Go to home
    }

    this.getClaimAmount(); // Get claim amount

    window.setInterval(() => {
      if (this.state.username !== undefined) { // Check username defined
        this.getTimeUntilClaim(); // Refresh claim time
      }
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
          <Button responsive={ true } size="xlarge" primary color="accent-2" label={ this.getClaimLabelText() } onClick={ this.makeClaim }/>
        </Box>
      </Grommet>
    )
  }

  // getTimeUntilClaim gets the amount of time until the next available claim.
  async getTimeUntilClaim() {
    await fetch("/api/faucet/"+this.state.username+"/NextClaimTime", {
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

  // getClaimAmount updates the local state with the latest claim amount.
  async getClaimAmount() {
    await fetch("/api/faucet/"+this.state.username+"/NextClaimAmount", {
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

  // makeClaim makes a new claim.
  async makeClaim() {
    await fetch("/api/faucet/Claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.state.username, // Set username
        amount: this.state.nextClaimAmount.toString(), // Set amount
      }), // Set body
    })
    .then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert

        return; // Return
      }

      this.successAlert(`Claimed ${ this.state.nextClaimAmount } SummerCash!`); // Alert successful claim

      this.getClaimAmount(); // Refresh claim amount
      this.getTimeUntilClaim(); // Refresh time until claim
    })
  }

  // getClaimLabel gets the claim label text.
  getClaimLabelText() {
    return `Claim ${ this.state.nextClaimAmount } SummerCash`; // Return text
  }
}

export default withRouter(Faucet); // Force use router