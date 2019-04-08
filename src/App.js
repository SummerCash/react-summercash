import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import SignupLogin from './SignupLogin'; // Import signup login page
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Heading, Paragraph, Box, Button, Layer, Form, FormField } from 'grommet';
import Blockies from 'react-blockies'; // Import identicons
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import TransactionView from './TransactionView'; // Import tx view
import { withRouter } from 'react-router-dom'; // Import router
import QRCode from 'qrcode.react';
import { Close } from 'grommet-icons'; // Import icons
import {CopyToClipboard} from 'react-copy-to-clipboard'; // Import clipboard
import QrReader from 'react-qr-reader'; // Import qr code reader

class App extends Component {
  errorAlert = (message) => toast.error(message); // Alert
  infoAlert = (message) => toast.info(message); // Alert
  successAlert = (message) => toast.success(message); // Alert

  // construct a new App component instance
  constructor(props) {
    super(props); // Super props

    const cookies = new Cookies(); // Initialize cookies

    this.fetchBalance = this.fetchBalance.bind(this); // Bind this
    this.onSubmitTx = this.onSubmitTx.bind(this); // Bind this
    this.handleScan = this.handleScan.bind(this); // Bind this

    this.fetchBalance(cookies.get('username')); // Fetch balance
  
    this.state = {
      username: cookies.get('username') || 'not-signed-in', // Get username cookie
      address: cookies.get('address') || 'not-signed-in', // Get address cookie
      password: cookies.get('password') || 'not-signed-in', // Get password cookie
      showSendModal: false, // Set show send modal
      showAddressModal: false, // Set show address modal
      showQRReader: false, // Set show qr modal
      alreadyPoppedRedeemable: false, // Set already popped
      balance: 0, // Set balance
      transactions: [], // Set transactions
    } // Set state
  }

  componentDidMount() {
    const cookies = new Cookies(); // Initialize cookies

    fetch("/api/accounts/"+cookies.get("username")+"/transactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        if (response.error.includes("no account exists with the given username")) { // Check shouldn't be logged in
          cookies.remove("username"); // Remove account details
          cookies.remove("password"); // Remove account details
          cookies.remove("address"); // Remove account details

          this.props.history.push("/"); // Go to home
        }

        this.errorAlert(response.error); // Alert
      } else if (!response.transactions) { // Check txs null
        if (!this.state.alreadyPoppedRedeemable) { // Check has not already popped
          this.infoAlert("Need some SummerCash? Look out for redeemable airdrop QR codes to earn your first coins."); // Alert

          this.setState({ alreadyPoppedRedeemable: true }); // Set state
        }
      } else {
        this.setState({ transactions: response.transactions }); // Set state txs
      }
    });
  }

  // render
  render() {
    if (this.state.username === 'not-signed-in' || this.state.username === '') { // Check not signed in
      return <SignupLogin /> // Render signup/login page
    }

    return (
      <Grommet theme={ theme }>
        <ToastContainer/>
        <Box margin={{ top: "large", left: "large" }} align="center" direction="row-responsive">
          <Box margin={{ right: "medium" }}>
            <Blockies seed={ this.state.address } size={ 5 } scale={ 15 } className="blocky"/>
          </Box>
          <Box margin={{ left: "none" }}>
            <Heading responsive={ true } size="medium" margin="none">
              { this.state.username }
            </Heading>
            <Paragraph responsive={ true } size="large" margin={{ top: "xsmall", bottom: "none" }}>
              { this.state.address }
            </Paragraph>
            <Paragraph responsive={ true } size="medium" margin={{ top: "xsmall" }}>
              Balance: { this.state.balance } SMC
            </Paragraph>
          </Box>
        </Box>
        <Heading responsive={ true } size="medium" margin={{ left: "large", top: "medium", bottom: "xsmall"}}>
          Transactions
        </Heading>
        <Box overflow="scroll" margin={{ left: "large" }} height="50%">
          { this.renderTransactions() }
        </Box>
        <Box direction="row" margin={{ left: "large" }} align="baseline" alignContent="start" alignSelf="start">
          <Button primary label="Send" onClick={ () => this.setState({ showSendModal: true }) } margin={{ top: "small" }} color="accent-2" size="xlarge"/>
          <Button label="Receive" onClick={ () => this.setState({ showAddressModal: true }) } margin={{ top: "small", left: "small" }} size="xlarge"/>
        </Box>
        { this.state.showAddressModal ? this.showAddressModal() : null }
        { this.state.showSendModal ? this.showSendModal() : null }
      </Grommet>
    );
  }

  fetchBalance(username) {
    fetch("/api/accounts/"+username+"/balance", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json())
    .then(response => {
      var balance = 0; // Init balance buffer

      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Error
      } else {
        balance = response.balance; // Set balance
      }

      this.setState({ balance: balance }); // Set state
    });
  }

  showAddressModal() {
    return (
      <Layer
        onEsc={ () => this.setState({ showAddressModal: false }) }
        onClickOutside={ () => this.setState({ showAddressModal: false }) }
        modal={ true }
        responsive={ false }
      >
        <Box margin={{ right: "medium", top: "small", bottom: "small" }} alignContent="end" align="end">
          <Close onClick={ () => this.setState({ showAddressModal: false }) } cursor="pointer"/>
        </Box>
        <Box align="center" alignContent="center" direction="column">
          <QRCode value={ this.state.address } size={ 512 }/>
          <CopyToClipboard text={ this.state.address }>
            <Button>
              <Paragraph responsive={ true }>{ this.state.address }</Paragraph>
            </Button>
          </CopyToClipboard>
        </Box>
      </Layer>
    );
  }

  showSendModal() {
    return (
      <Layer
        onEsc={ () => this.setState({ showSendModal: false }) }
        onClickOutside={ () => this.setState({ showSendModal: false }) }
        modal={ true }
        responsive={ false }
      >
        <Box margin={{ right: "medium", top: "small", bottom: "none" }} alignContent="end" align="end">
          <Close onClick={ () => this.setState({ showSendModal: false, showQRReader: false }) } cursor="pointer"/>
        </Box>
        <Box align="center" alignContent="center" direction="column" pad="medium">
          <Form onSubmit={ this.onSubmitTx }>
            <FormField name="amount" ref="amount_input" label="Amount" placeholder="1.23456" required={ true } size="xxlarge"/>
            <FormField name="recipient" ref="recipient_input" label="Recipient" placeholder="@username / 0x1234" required={ true } size="xxlarge"/>
            <Box align="center" alignContent="center" alignSelf="center" direction="row-responsive">
              <Button primary type="submit" label="Send" color="accent-2"/>
              <Button margin={{ left: "small" }} label="Scan QR Code" onClick={ () => this.setState({ showQRReader: true }) }/>
            </Box>
          </Form>
        </Box>
        { this.state.showQRReader ? this.showQRReader() : null }
      </Layer>
    )
  }

  showQRReader() {
    return (
      <QrReader facingMode="environment" onScan={ this.handleScan } onError={ this.handleScanError }/>
    )
  }

  handleScan (scan) {
    if (scan) { // Check scanned
      if (!scan.includes("@") && !scan.includes("0x")) { // Check is not tx
        this.errorAlert("Invalid QR code (must be @username or 0x1234 address)"); // Alert
      }

      this.setState({ showQRReader: false }); // Hide reader
    }
  }

  handleScanError (err) {
    this.errorAlert(err); // Alert
  }

  // onSubmitTx handles the tx form submit event.
  onSubmitTx (event) {
    event.preventDefault(); // Prevent default

    var formData = JSON.parse(JSON.stringify(event.value)); // Get from data

    formData.recipient = formData.recipient.replace("@", ""); // Remove @ symbol

    fetch("/api/transactions/NewTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.state.username, // Set username
        recipient: formData.recipient, // Set recipient
        amount: parseFloat(formData.amount), // Set amount
        password: this.state.password, // Set password
      })
    }).then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert
      } else {
        this.successAlert("Transaction sent successfully!"); // Alert success
      }

      this.fetchTransactions(); // Fetch transactions

      this.setState({
        showSendModal: false,
        showQRReader: false,
      }); // Set state
    })
  }

  // fetchTransactions fetches all account txs.
  fetchTransactions() {
    const cookies = new Cookies(); // Initialize cookies

    fetch("/api/accounts/"+cookies.get("username")+"/transactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        if (response.error.includes("no account exists with the given username")) { // Check shouldn't be logged in
          cookies.remove("username"); // Remove account details
          cookies.remove("password"); // Remove account details
          cookies.remove("address"); // Remove account details

          this.props.history.push("/"); // Go to home
        }

        this.errorAlert(response.error); // Alert
      } else if (!response.transactions) { // Check txs null
        if (!this.state.alreadyPoppedRedeemable) { // Check has not already popped
          this.infoAlert("Need some SummerCash? Look out for redeemable airdrop QR codes to earn your first coins."); // Alert

          this.setState({ alreadyPoppedRedeemable: true }); // Set state
        }
      } else {
        this.setState({ transactions: response.transactions }); // Set state txs
      }
    });
  }

  // renderTransactions renders the transaction views.
  renderTransactions() {
    var transactionViews = []; // Init tx views

    var x; // Init iterator

    for (x = 0; x < this.state.transactions.length; x++) { // Iterate through txs
      var type = "send"; // Init type buffer

      if (x > 0) { // Check not out of bounds
        if (this.state.transactions[x-1].hash === this.state.transactions[x].hash && this.state.transactions[x].recipient === this.state.address && this.state.transactions[x].sender === this.state.address) { // Check is second of two recursive txs
          type = "receive"; // Set type
        }
      } else if (this.state.transactions[x].recipient !== this.state.address) { // Check is sending
        type = "receive"; // Set receive
      }

      transactionViews.push(
        <TransactionView
          key={ x }
          margin="none"
          gap="large"
          type={ type }
          timestamp={ this.state.transactions[x].time }
          hash={ this.state.transactions[x].hash }
          amount={ this.state.transactions[x].amount }
        />
      ); // Push tx
    }

    return transactionViews; // Return tx views
  }
}

export default withRouter(App); // Force use router
