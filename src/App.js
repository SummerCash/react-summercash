import React, { Component } from 'react';
import './App.css';
import Cookies from 'universal-cookie';
import SignupLogin from './SignupLogin'; // Import signup login page
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Heading, Paragraph, Box, Button, Layer, Form, FormField, TextInput } from 'grommet';
import Blockies from 'react-blockies'; // Import identicons
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import TransactionView from './TransactionView'; // Import tx view
import { withRouter } from 'react-router-dom'; // Import router
import QRCode from 'qrcode.react';
import { Close } from 'grommet-icons'; // Import icons
import {CopyToClipboard} from 'react-copy-to-clipboard'; // Import clipboard
import QrReader from 'react-qr-reader'; // Import qr code reader
import { sha3_512 } from 'js-sha3'; // Import sha3
import domtoimage from 'dom-to-image'; // Import print
import print from 'print-js'; // Import print
import Media from 'react-media';

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
    this.handleScanError = this.handleScanError.bind(this); // Bind this
    this.makeRedeemableAccount = this.makeRedeemableAccount.bind(this); // Bind this
    this.showRedeemable = this.showRedeemable.bind(this); // Bind this

    this.recipient_input = React.createRef(); // Create ref
    this.printTriggerRef = React.createRef(); // Create ref

    if (cookies.get("username") !== "" && cookies.get("username") !== "not-signed-in" && cookies.get("username") !== undefined) { // Check signed in
      this.fetchBalance(cookies.get('username')); // Fetch balance
    }
  
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
      sendAddressValue: "", // Set send addr
      shouldMakeRedeemable: false, // Set should make redeemable
      redeemableAccount: null, // Set redeemable account
      lastPayload: "", // Set last payload
      showRedeemableModal: false, // Set show redeemable modal
      showRedeemModal: false, // Set show redeem modal
    } // Set state
  }

  componentDidMount() {
    const cookies = new Cookies(); // Initialize cookies

    if (cookies.get("username") !== "" && cookies.get("username") !== "not-signed-in" && cookies.get("username") !== undefined) { // Check signed in
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

          window.setInterval(() => {
            var oldBalance = JSON.parse(JSON.stringify(this.state.balance)); // Get old balance

            this.fetchBalance(this.state.username); // Refresh balance

            if (this.state.balance !== oldBalance) { // Check did change
              this.fetchTransactions(); // Fetch transactions
            }
          }, 1000); // Sync every 2 seconds
        }
      });
    }
  }

  // render
  render() {
    if (this.state.username === 'not-signed-in' || this.state.username === '') { // Check not signed in
      return <SignupLogin /> // Render signup/login page
    }

    return (
      <Grommet theme={ theme } full>
        <ToastContainer/>
        <Box margin={{ top: "large", left: "large", right: "large" }} align="center" direction="row">
          <Box margin={{ right: "medium" }}>
            <Blockies seed={ this.state.address } size={ 5 } scale={ 15 } className="blocky"/>
          </Box>
          <Box margin={{ left: "none" }}>
            <Heading responsive={ true } size="medium" margin="none">
              { this.state.username }
            </Heading>
            <Media query="(min-width:770px)">
              <Paragraph responsive={ true } size="large" margin={{ top: "xsmall", bottom: "none" }}>
                { this.state.address }
              </Paragraph>
            </Media>
            <Media query="(max-width:779px)">
              <Media query="(min-width: 440px)">
                <Paragraph responsive={ true } size="small" margin={{ top: "xsmall", bottom: "none" }}>
                  { this.state.address }
                </Paragraph>
              </Media>
            </Media>
            <Paragraph responsive={ true } size="medium" margin={{ top: "xsmall" }}>
              Balance: { this.state.balance } SMC
            </Paragraph>
          </Box>
        </Box>
        <Heading responsive={ true } size="medium" margin={{ left: "large", top: "medium", bottom: "xsmall"}}>
          Transactions
        </Heading>
        <Box overflow={{ "vertical": "scroll" }} margin={{ left: "large" }} height="50%">
          { this.renderTransactions() }
        </Box>
        <Media query="(min-width:605px)">
          { matches =>
            matches ? (
              <Box direction="row" margin={{ left: "large" }} align="baseline" alignContent="start" alignSelf="start">
                <Button primary label="Send" onClick={ () => this.setState({ showSendModal: true }) } margin={{ top: "small" }} color="accent-2" size="xlarge"/>
                <Button label="Receive" onClick={ () => this.setState({ showAddressModal: true }) } margin={{ top: "small", left: "small" }} size="xlarge"/>
                <Button label="Redeem" onClick={ () => this.setState({ showRedeemModal: true }) } margin={{ top: "small", left: "small" }} size="xlarge"/>
              </Box>
            ) : (
              <Box flex={ false } direction="column" fill="vertical" responsive={ true } margin={{ left: "medium", right: "medium" }} tag="footer">
                <Button primary label="Send" onClick={ () => this.setState({ showSendModal: true }) } margin={{ top: "small" }} color="accent-2"/>
                <Button label="Receive" onClick={ () => this.setState({ showAddressModal: true }) } margin={{ top: "small" }}/>
                <Button label="Redeem" onClick={ () => this.setState({ showRedeemModal: true }) } margin={{ top: "small" }}/>
              </Box>
            )
          }
        </Media>
        { this.state.showAddressModal ? this.showAddressModal() : null }
        { this.state.showSendModal ? this.showSendModal() : null }
        { this.state.showRedeemableModal ? this.showRedeemable() : null }
        { this.state.showRedeemModal ? this.showRedeem() : null }
      </Grommet>
    );
  }

  fetchBalancePure(username) {
    return fetch("/api/accounts/"+username+"/balance", {
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

      return balance; // Return balance
    });
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

  showRedeem() {
    return (
      <Layer
        onEsc={ () => this.setState({ showRedeemModal: false }) }
        onClickOutside={ () => this.setState({ showRedeemModal: false }) }
        modal={ true }
        responsive={ false }
      >
        <Box margin={{ right: "medium", top: "small", bottom: "none" }} alignContent="end" align="end">
          <Close onClick={ () => this.setState({ showRedeemModal: false }) } cursor="pointer"/>
        </Box>
        <Box align="center" alignContent="center" direction="column">
          <Heading margin={{ left: "xlarge", right: "xlarge", top: "none" }} responsive={ true }>
            Scan a code!
          </Heading>
        </Box>
        <QrReader facingMode="environment" onScan={ this.handleScan } onError={ this.handleScanError }/>
      </Layer>
    );
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
      <Media query="(min-width:427px)">
        { matches =>
          matches ? (
            <Layer
              onEsc={ () => this.setState({ showSendModal: false }) }
              onClickOutside={ () => this.setState({ showSendModal: false }) }
              modal={ true }
              responsive={ false }
            >
              <Box align="center" alignContent="center" direction="column" pad="medium">
                <Form onSubmit={ this.onSubmitTx }>
                  <FormField name="amount" ref={"amount_input"} label="Amount" placeholder="1.23456" required={ true } size="xxlarge"/>
                  <FormField name="recipient" label="Recipient" required={ false } size="xxlarge">
                    <TextInput ref="recipient_input" value={ this.state.sendAddressValue } onChange={ event => this.setState({ sendAddressValue: event.target.value }) } placeholder="@username / 0x1234" size="xxlarge"/>
                  </FormField>
                  <FormField name="message" label="Message" placeholder="Say something nice!" required={ false } size="xxlarge"/>
                  <Media query="(min-width: 1066px)">
                    { matches =>
                      matches ? (
                        <Box align="center" alignContent="center" alignSelf="center" direction="row">
                          <Button primary type="submit" label="Send" color="accent-2"/>
                          <Button primary margin={{ left: "small" }} type="submit" label="Make Redeemable" onClick={ () => this.setState({ shouldMakeRedeemable: true }) } color="accent-2"/>
                          <Button ref={ this.recipient_input } margin={{ left: "small" }} label="Scan QR Code" onClick={ () => this.setState({ showQRReader: true }) }/>
                        </Box>
                      ) : (
                        <Box align="center" alignContent="center" alignSelf="center" direction="row">
                          <Button primary type="submit" label="Send" color="accent-2"/>
                          <Button primary margin={{ left: "small" }} type="submit" label="Redeemable" onClick={ () => this.setState({ shouldMakeRedeemable: true }) } color="accent-2"/>
                          <Button ref={ this.recipient_input } margin={{ left: "small" }} label="Scan" onClick={ () => this.setState({ showQRReader: true }) }/>
                        </Box>
                      )
                    }
                  </Media>
                </Form>
              </Box>
              { this.state.showQRReader ? this.showQRReader() : null }
            </Layer>
          ) : (
            <Layer
              onEsc={ () => this.setState({ showSendModal: false }) }
              onClickOutside={ () => this.setState({ showSendModal: false }) }
              modal={ true }
              responsive={ true }
            >
              <Box align="end" margin={{ right: "large", top: "medium" }}>
                <Close onClick={ () => this.setState({ showSendModal: false }) } cursor="pointer"/>
              </Box>
              <Box align="center" alignContent="center" direction="column" pad="medium">
                <Form onSubmit={ this.onSubmitTx }>
                  <FormField name="amount" ref={"amount_input"} label="Amount" placeholder="1.23456" required={ true } size="xxlarge"/>
                  <FormField name="recipient" label="Recipient" required={ false } size="xxlarge">
                    <TextInput ref="recipient_input" value={ this.state.sendAddressValue } onChange={ event => this.setState({ sendAddressValue: event.target.value }) } placeholder="@username / 0x1234" size="xxlarge"/>
                  </FormField>
                  <FormField name="message" label="Message" placeholder="Say something nice!" required={ false } size="xxlarge"/>
                  <Media query="(min-width: 1066px)">
                    { matches =>
                      matches ? (
                        <Box align="center" alignContent="center" alignSelf="center" direction="row">
                          <Button primary type="submit" label="Send" color="accent-2"/>
                          <Button primary margin={{ left: "small" }} type="submit" label="Make Redeemable" onClick={ () => this.setState({ shouldMakeRedeemable: true }) } color="accent-2"/>
                          <Button ref={ this.recipient_input } margin={{ left: "small" }} label="Scan QR Code" onClick={ () => this.setState({ showQRReader: true }) }/>
                        </Box>
                      ) : (
                        <Box align="center" alignContent="center" alignSelf="center" direction="row">
                          <Button primary type="submit" label="Send" color="accent-2"/>
                          <Button primary margin={{ left: "small" }} type="submit" label="Redeemable" onClick={ () => this.setState({ shouldMakeRedeemable: true }) } color="accent-2"/>
                          <Button ref={ this.recipient_input } margin={{ left: "small" }} label="Scan" onClick={ () => this.setState({ showQRReader: true }) }/>
                        </Box>
                      )
                    }
                  </Media>
                </Form>
              </Box>
              { this.state.showQRReader ? this.showQRReader() : null }
            </Layer>
          )
        }
      </Media>
    )
  }

  makeRedeemableAccount() {
    this.setState({
      redeemableAccount: null, // Reset redeemable account
    });

    var redeemableUsername = this.state.username+"_"+Math.random().toString(36).substring(7); // Generate redeemable username
    var redeemablePassword = sha3_512(Math.random().toString(36).substring(7)); // Generate redeemable password

    return fetch("/api/accounts/"+redeemableUsername, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: redeemablePassword, // Set password
      })
    }).then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert
      } else {
        this.setState({
          redeemableAccount: {
            username: redeemableUsername, // Set user
            password: redeemablePassword, // Set pass
          } // Set redeemable account
        }) // Update state
      }
    });
  }

  showQRReader() {
    return (
      <QrReader facingMode="environment" onScan={ this.handleScan } onError={ this.handleScanError }/>
    )
  }

  showRedeemable() {
    return (
      <Layer
        onEsc={ () => this.setState({ showRedeemableModal: false, showSendModal: false, showQRReader: false, sendAddressValue: "", shouldMakeRedeemable: false, lastPayload: "" }) }
        onClickOutside={ () => this.setState({ showRedeemableModal: false, showSendModal: false, showQRReader: false, sendAddressValue: "", shouldMakeRedeemable: false, lastPayload: "" }) }
        modal={ true }
        responsive={ false }
      >
        <Box margin={{ right: "medium", top: "small", bottom: "small" }} alignContent="end" align="end">
          <Close onClick={ () => this.setState({ showRedeemableModal: false, showSendModal: false, showQRReader: false, sendAddressValue: "", shouldMakeRedeemable: false, lastPayload: "" }) } cursor="pointer"/>
        </Box>
        <div id="print-contents">
          <Box align="center" alignContent="center" direction="column">
            <QRCode value={ this.state.redeemableAccount.username+"_"+this.state.redeemableAccount.password } size={ 512 }/>
            <Paragraph responsive={ true }>{ this.state.lastPayload }</Paragraph>
          </Box>
        </div>
        <Button primary onClick={ () => this.printContents() } label="Print" margin={{ top: "none", bottom: "small", left: "small", right: "small" }} color="accent-2" size="xlarge"/>
      </Layer>
    )
  }

  printContents() {
    const node = document.getElementById("print-contents"); // Get node

    domtoimage.toJpeg(node, { bgcolor: "white" }) // Generate PNG image
    .then((dataUrl) => {
        print({ printable: dataUrl, type: "image", imageStyle: "width:70%; height:70%;transform:rotate(-90deg);margin-top:-2%;"}); // Print
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error); // Log error
    });
  }

  handleScan (scan) {
    if (scan) { // Check scanned
      if (!scan.includes("@") && !scan.includes("0x") && !scan.includes("_")) { // Check is not tx
        this.errorAlert("Invalid QR code (must be @username or 0x1234 address)"); // Alert
      } else if (scan.includes("@") || scan.includes("0x")) {
        this.setState({ showQRReader: false, sendAddressValue: scan }); // Hide reader
      } else if (scan.includes("_")) {
        var redeemableAccount = {
          username: scan.split("_")[0]+"_"+scan.split("_")[1],
          password: scan.split("_")[2],
        } // Get acc

        fetch("/api/accounts/"+redeemableAccount.username+"/authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: redeemableAccount.password,
          })
        }).then((response) => response.json())
        .then(response => {
          if (response.error) { // Check for errors
            this.errorAlert(response.error); // Log error
          } else {
            var redeemableBalance = 0; // Init buffer

            this.fetchBalancePure(redeemableAccount.username)
            .then((balance) => {
              redeemableBalance = balance; // Set redeemable balance

              fetch("/api/transactions/NewTransaction", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  username: redeemableAccount.username, // Set username
                  password: redeemableAccount.password, // Set password
                  recipient: this.state.address, // Set username
                  amount: redeemableBalance, // Send entire balance
                })
              })
              .then((response) => response.json())
              .then(response => {
                if (response.error) { // Check for errors
                  this.errorAlert(response.error); // Log error
                } else {
                  this.fetchBalance(this.state.username); // Check balance
                  this.fetchTransactions(); // Check txs
  
                  this.setState({ showRedeemModal: false, showQRReader: false}); // Close modal

                  fetch("/api/accounts/"+redeemableAccount.username, {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      username: redeemableAccount.username, // Set username
                      password: redeemableAccount.password, // Set password
                    })
                  })
                  .then((response) => response.json())
                  .then(response => {
                    if (response.error) {
                      this.errorAlert(response.error); // Alert
                    }
                  })
                }
              })
            });
          }
        })
      }
    }
  }

  handleScanError (err) {
    this.errorAlert(err); // Alert
  }

  // onSubmitTx handles the tx form submit event.
  onSubmitTx (event) {
    event.preventDefault(); // Prevent default

    var formData = JSON.parse(JSON.stringify(event.value)); // Get from data

    if (this.state.shouldMakeRedeemable) { // Check is processing elsewhere
      this.setState({ shouldMakeRedeemable: false, lastPayload: formData.message }); // Reset

      this.makeRedeemableAccount()
      .then(() => fetch("/api/transactions/NewTransaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.state.username, // Set username
          recipient: this.state.redeemableAccount.username, // Set recipient
          amount: parseFloat(formData.amount), // Set amount
          password: this.state.password, // Set password
          payload: formData.message, // Set message
        })
      }))
      .then((response) => response.json())
      .then(response => {
        if (response.error) { // Check for errors
          this.errorAlert(response.error); // Alert
  
          return; // Return
        }

        this.fetchTransactions(); // Fetch transactions

        this.setState({
          showSendModal: false,
          showQRReader: false,
          sendAddressValue: "",
          showRedeemableModal: true,
        }); // Set show redeemable modal
      }); // Make redeemable

      return; // Return
    }

    if (!formData.recipient) { // Check needs manual set
      formData.recipient = this.state.sendAddressValue; // Get address
    }

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
        payload: formData.message,
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
        sendAddressValue: "",
      }); // Set state
    })
  }

  // fetchTransactions fetches all account txs.
  fetchTransactions() {
    const cookies = new Cookies(); // Initialize cookies

    if (cookies.get("username") !== "" && cookies.get("username") !== "not-signed-in" && cookies.get("username") !== undefined) { // Check signed in
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
  }

  // renderTransactions renders the transaction views.
  renderTransactions() {
    var transactionViews = []; // Init tx views

    var x; // Init iterator

    for (x = 0; x < this.state.transactions.length; x++) { // Iterate through txs
      var type = "send"; // Init type buffer

      if (x > 0 && this.state.transactions[x-1].hash === this.state.transactions[x].hash && this.state.transactions[x].recipient === this.state.address && this.state.transactions[x].sender === this.state.address) { // Check not out of bounds
        type = "receive"; // Set type
      } else if (this.state.transactions[x].recipient !== this.state.address) { // Check is sending
        type = "send"; // Set send
      } else if (this.state.transactions[x].recipient === this.state.address && this.state.transactions[x].sender !== this.state.address) { // Check is receiving
        type = "receive"; // Set receive
      }

      var payload = "";

      if (this.state.transactions[x].payload) { // Check has payload
        payload = atob(this.state.transactions[x].payload); // Decode payload
      }

      var max = 12; // Get max substring

      if (window.innerWidth < 424) { // Check width less than 424px
        max = 7; // Set max substring
      }

      switch (type) {
        case "send":
          transactionViews.push(
            <TransactionView
              key={ x }
              margin="small"
              gap="small"
              type={ type }
              timestamp={ this.state.transactions[x].time }
              shortTimestamp={ this.state.transactions[x].time.toString().split(" ")[0] }
              recipient={ this.state.transactions[x].recipient.toString().substring(0, max) }
              amount={ this.state.transactions[x].amount }
              message={ payload }
            />
          ); // Push tx

          break;
        case "receive":
          transactionViews.push(
            <TransactionView
              key={ x }
              margin="small"
              gap="small"
              type={ type }
              timestamp={ this.state.transactions[x].time }
              shortTimestamp={ this.state.transactions[x].time.toString().split(" ")[0] }
              sender={ this.state.transactions[x].sender.toString().substring(0, max) }
              amount={ this.state.transactions[x].amount }
              message={ payload }
            />
          ); // Push tx

          break;
        default:
          break;
      }
    }

    return transactionViews; // Return tx views
  }
}

export default withRouter(App); // Force use router
