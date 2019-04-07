import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import SignupLogin from './SignupLogin'; // Import signup login page
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Heading, Paragraph, Box, Button } from 'grommet';
import Blockies from 'react-blockies'; // Import identicons
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import TransactionView from './TransactionView'; // Import tx view

class App extends Component {
  errorAlert = (message) => toast.error(message); // Alert
  infoAlert = (message) => toast.info(message); // Alert

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
        <ToastContainer/>
        <Box margin={{ top: "medium", left: "medium" }} align="center" direction="row-responsive">
          <Box margin={{ right: "medium" }}>
            <Blockies seed={ this.state.address } size={ 5 } scale={ 15 } className="blocky"/>
          </Box>
          <Box margin={{ left: "none" }}>
            <Heading responsive={ true } size="medium" margin="none">
              { this.state.username }
            </Heading>
            <Paragraph responsive={ true } size="large" margin={{ top: "xsmall" }}>
              { this.state.address }
            </Paragraph>
          </Box>
        </Box>
        <Heading responsive={ true } size="medium" margin={{ left: "medium", top: "medium", bottom: "xsmall"}}>
          Transactions
        </Heading>
        <Box overflow="scroll" margin={{ left: "medium" }}>
          { this.renderTransactions() }
        </Box>
        <Box direction="row" margin={{ left: "medium" }} align="baseline" alignContent="start" alignSelf="start">
          <Button primary label="Send" margin={{ top: "small" }} color="accent-2" size="xlarge"/>
          <Button label="Receive" margin={{ top: "small", left: "small" }} size="xlarge"/>
        </Box>
      </Grommet>
    );
  }

  // renderTransactions renders the transaction views.
  renderTransactions() {
    const cookies = new Cookies(); // Initialize cookies

    fetch("/api/accounts/"+cookies.get("username")+"/transactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert
      } else if (!response.transactions) { // Check txs null
        this.infoAlert("Need some SummerCash? Look out for redeemable airdrop QR codes to earn your first coins.")
      } else { // No errors
        var transactionViews = []; // Init tx views

        var x; // Init iterator

        for (x = 0; x < response.transactions.length; x++) { // Iterate through txs
          var type = "send"; // Init type buffer

          if (response.transactions[x].sender !== cookies.get("address")) { // Check is sending
            type = "receive"; // Set receive
          }

          transactionViews.push(
            <TransactionView
              margin="medium"
              gap="large"
              type={ type }
              timestamp={ response.transactions[x].time }
              hash={ response.transactions[x].hash }
              amount={ response.transactions[x].amount }
            />
          ); // Push tx
        }

        return transactionViews;
      }
    })
  }
}

export default App;
