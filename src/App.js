/* eslint-disable no-loop-func */
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
import CookieBanner from 'react-cookie-banner'; // Import cookie banner

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
    this.qrRef = React.createRef(); // Create ref

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
      lastTxHash: "", // Set last tx hash
      alreadyReceivedHashes: [], // Set received hashes
      hasInitiallyLoaded: false, // Set has already loaded
      hasAlreadyScanned: false, // Set has already scanned
      hasCookie: cookies.get("has-cookie-accept"), // Set has cookie
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
        }

        window.setInterval(() => {
          var oldTxHash = JSON.parse(JSON.stringify(this.state.lastTxHash)); // Get old tx hash

          this.fetchLastTxHash(this.state.username)
          .then(() => {
            if (this.state.lastTxHash !== oldTxHash) { // Check did change
              this.fetchTransactions(); // Fetch transactions
            }
          }) // Refresh last tx hash
        }, 500); // Sync every 500 milliseconds
      });
    }
  }

  // render
  render() {
    if (this.state.username === 'not-signed-in' || this.state.username === '') { // Check not signed in
      return <SignupLogin /> // Render signup/login page
    }

    let cookieBanner; // Init buffer

    var userAgent = navigator.userAgent.toLowerCase(); // Get user agent

    if (!this.state.hasCookie && userAgent.indexOf(' electron/') === -1) { // Has not accepted cookie
      cookieBanner = <CookieBanner
        message="We uses cookies to ensure you get the best experience on our website."
        onAccept={() => {}}
        cookie="has-cookie-accept"
      />; // Set cookie banner
    }

    return (
      <Grommet theme={ theme } full>
        <ToastContainer/>
        { cookieBanner }
        <Box margin={{ top: "large", left: "large", right: "large" }} align="center" direction="row">
          <Box margin={{ right: "medium" }}>
            <Blockies seed={ this.state.address } size={ 5 } scale={ 15 } className="blocky"/>
          </Box>
          <Box margin={{ left: "small" }}>
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
        { this.state.showRedeemableModal ? this.showRedeemable(512, 535, true) : null }
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

  fetchLastTxHash(username) {
    return fetch("/api/accounts/"+username+"/lastHash", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json())
    .then(response => {
      if (!response.error) {
        this.setState({ lastTxHash: response.hash }); // Set hash
      }
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
      <Media query="(min-width:588px)">
        { matches =>
          matches ? (
            <Layer
              onEsc={ () => this.setState({ showRedeemModal: false }) }
              onClickOutside={ () => this.setState({ showRedeemModal: false }) }
              modal={ true }
              responsive={ false }
            >
              <Box margin={{ right: "medium", top: "small", bottom: "none" }} alignContent="end" align="end" responsive={ false }>
                <Close onClick={ () => this.setState({ showRedeemModal: false }) } cursor="pointer"/>
              </Box>
              <Box align="center" alignContent="center" direction="column" responsive={ false }>
                <Heading margin={{ left: "xlarge", right: "xlarge", top: "none" }} responsive={ true }>
                  Scan a code!
                </Heading>
              </Box>
              <QrReader facingMode="environment" onScan={ this.handleScan } onError={ this.handleScanError }/>
            </Layer>
          ) : (
            <Layer
              onEsc={ () => this.setState({ showRedeemModal: false }) }
              onClickOutside={ () => this.setState({ showRedeemModal: false }) }
              modal={ true }
              responsive={ true }
            >
              <Box alignContent="end" align="end" margin={{ top: "medium", right: "medium" }} overflow={{ vertical: "hidden" }}>
                <Close color="white" onClick={ () => this.setState({ showRedeemModal: false }) } cursor="pointer" overflow={{ vertical: "hidden" }}/>
              </Box>
              <QrReader facingMode="environment" onScan={ this.handleScan } onError={ this.handleScanError } showViewFinder={ false } className="mobile-qr"/>
            </Layer>
          )
        }
      </Media>
    );
  }

  showAddressModal() {
    return (
      <Media query="(min-width:544px)">
        { matches =>
          matches ? (
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
          ) : (
            <Media query="(min-width:355px)">
              { matches =>
                matches ? (
                  <Layer
                    onEsc={ () => this.setState({ showAddressModal: false }) }
                    onClickOutside={ () => this.setState({ showAddressModal: false }) }
                    modal={ true }
                    responsive={ false }
                  >
                    <Box margin={{ right: "medium", top: "medium", bottom: "medium" }} alignContent="end" align="end">
                      <Close onClick={ () => this.setState({ showAddressModal: false }) } cursor="pointer"/>
                    </Box>
                    <Box align="center" alignContent="center" direction="column">
                      <QRCode value={ this.state.address } size={ 320 }/>
                      <CopyToClipboard text={ this.state.address }>
                        <Button>
                          <Paragraph size="small" responsive={ true }>{ this.state.address }</Paragraph>
                        </Button>
                      </CopyToClipboard>
                    </Box>
                  </Layer>
                ) : (
                  <Layer
                    onEsc={ () => this.setState({ showAddressModal: false }) }
                    onClickOutside={ () => this.setState({ showAddressModal: false }) }
                    modal={ true }
                    responsive={ false }
                  >
                    <Box margin={{ right: "medium", top: "medium", bottom: "medium" }} alignContent="end" align="end">
                      <Close onClick={ () => this.setState({ showAddressModal: false }) } cursor="pointer"/>
                    </Box>
                    <Box align="center" alignContent="center" direction="column" pad={{ bottom: "xlarge" }}>
                      <QRCode value={ this.state.address } size={ 256 }/>
                    </Box>
                  </Layer>
                )
              }
            </Media>
          )
        }
      </Media>
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
                  <FormField name="burn_rate" ref={"burn_input"} label="Burn Rate" placeholder="0.123456" required={ false } size="xxlarge"/>
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
                  <FormField name="burn_rate" ref={"burn_input"} label="Burn Rate" placeholder="0.123456" required={ false } size="xxlarge"/>
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

  makeRedeemableAccount(burn_rate) {
    this.setState({
      redeemableAccount: null, // Reset redeemable account
    });

    var redeemableUsername = this.state.username+"_"+Math.random().toString(36).substring(7); // Generate redeemable username

    if (burn_rate !== undefined && burn_rate && burn_rate !== 0) { // Check has burn rate
      redeemableUsername = this.state.username+"_"+Math.random().toString(36).substring(7)+"_burnrate:"+burn_rate; // Add burn rate
    }

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

  showRedeemable(startingSize, startingMediaSize, isStart) {
    return (
      <Layer
        onEsc={ () => this.setState({ showRedeemableModal: false, showSendModal: false, showQRReader: false, sendAddressValue: "", shouldMakeRedeemable: false, lastPayload: "" }) }
        onClickOutside={ () => this.setState({ showRedeemableModal: false, showSendModal: false, showQRReader: false, sendAddressValue: "", shouldMakeRedeemable: false, lastPayload: "" }) }
        modal={ isStart }
        responsive={ false }
      >
        <Box margin={{ right: "medium", top: "small", bottom: "small" }} alignContent="end" align="end">
          <Close onClick={ () => this.setState({ showRedeemableModal: false, showSendModal: false, showQRReader: false, sendAddressValue: "", shouldMakeRedeemable: false, lastPayload: "" }) } cursor="pointer"/>
        </Box>
        <div id="print-contents">
          <Box align="center" alignContent="center" direction="column">
            <Heading size="small" margin={{ top: "none" }}>Scan in SummerCash Wallet</Heading>
            <Media query={this.getQuery(startingMediaSize)}>
              { matches =>
                matches ? (
                  <QRCode value={ this.state.redeemableAccount.username+"_"+this.state.redeemableAccount.password } size={ startingSize }/>
                ) : (
                  this.showRedeemable(startingSize - 32, startingMediaSize - 32, false)
                )
              }
            </Media>
            <Paragraph responsive={ true }>{ this.state.lastPayload }</Paragraph>
          </Box>
        </div>
        <Button primary onClick={ () => this.printContents() } label="Print" margin={{ top: "none", bottom: "small", left: "small", right: "small" }} color="accent-2" size="xlarge"/>
      </Layer>
    )
  }

  getQuery(size) {
    return `(min-width:${size}px)`;
  }

  printContents() {
    const node = document.getElementById("print-contents"); // Get node

    domtoimage.toJpeg(node, { bgcolor: "white" }) // Generate PNG image
    .then((dataUrl) => {
        print({ printable: dataUrl, type: "image", imageStyle: "width:70%; height:70%;transform:rotate(-90deg);margin-top:-5%;margin-left: 10%;"}); // Print
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error); // Log error
    });
  }

  handleScan (scan) {
    if (scan && !this.state.hasAlreadyScanned) { // Check scanned
      this.setState({ hasAlreadyScanned: true }); // Has already scanned

      if (!scan.includes("@") && !scan.includes("0x") && !scan.includes("_")) { // Check is not tx
        this.errorAlert("Invalid QR code (must be @username or 0x1234 address)"); // Alert

        this.setState({ hasAlreadyScanned: false }); // Reset has already scanned
      } else if (scan.includes("@") || scan.includes("0x")) {
        this.setState({ showQRReader: false, sendAddressValue: scan, hasAlreadyScanned: false }); // Hide reader
      } else if (scan.includes("_")) {
        var redeemableAccount; // Init buffer

        if (scan.includes("_burnrate")) { // Check has burn rate
          redeemableAccount = {
            username: scan.split("_burnrate:")[0]+"_burnrate:"+scan.split("_burnrate:")[1].split("_")[0],
            password: scan.split("_")[scan.split("_").length - 1],
          } // Set acc
        } else {
          redeemableAccount = {
            username: scan.split("_")[0]+"_"+scan.split("_")[1],
            password: scan.split("_")[2],
          } // Get acc
        }

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

              if (redeemableAccount.username.includes("_burnrate:")) { // Check has burn rate
                redeemableBalance = parseFloat(redeemableAccount.username.split("_burnrate:")[1]); // Set redeemable balance
              }

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
                }
              })
            });
          }

          this.setState({ hasAlreadyScanned: false }); // Reset has already scanned
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

    if (formData.amount < 0) { // Check negative number
      this.errorAlert("Invalid transaction amount; cannot send negative amounts of SummerCash."); // Alert

      return; // Return
    }

    if (this.state.shouldMakeRedeemable) { // Check is processing elsewhere
      this.setState({ shouldMakeRedeemable: false, lastPayload: formData.message }); // Reset

      this.makeRedeemableAccount(formData.burn_rate)
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

    if (!formData.message) { // Check no message
      formData.message = ""; // Prevent undefined
    } 

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
  async fetchTransactions() {
    this.fetchBalance(this.state.username); // Fetch balance

    const cookies = new Cookies(); // Initialize cookies

    if (cookies.get("username") !== "" && cookies.get("username") !== "not-signed-in" && cookies.get("username") !== undefined) { // Check signed in
      fetch("/api/accounts/"+cookies.get("username")+"/transactions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => response.json())
      .then(async response => {
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
          var i; // Declare iterator

          for (i = 0; i < response.transactions.length; i++) { // Iterate through txs
            if ((!this.state.alreadyReceivedHashes.includes(response.transactions[i].hash)) && (response.transactions[i].recipient === this.state.username || response.transactions[i].recipient === this.state.address)) { // Check new hash
              if (this.state.hasInitiallyLoaded) { // Check has already loaded
                this.successAlert(`Received ${response.transactions[i].amount} SummerCash from ${response.transactions[i].sender}!`); // Alert received
              }

              var newAlreadyReceivedHashes = [...this.state.alreadyReceivedHashes]; // Clone already received

              newAlreadyReceivedHashes.push(response.transactions[i].hash); // Append hash

              this.setState({ alreadyReceivedHashes: newAlreadyReceivedHashes }); // Set already received
            }
          }

          if (!this.state.hasInitiallyLoaded) { // Check not already loaded
            this.setState({ hasInitiallyLoaded: true }); // Set already loaded
          }

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

      if (x > 0 && this.state.transactions[x-1].hash === this.state.transactions[x].hash && (this.state.transactions[x].recipient === this.state.address || this.state.transactions[x].recipient === this.state.username) && (this.state.transactions[x].sender === this.state.address || this.state.transactions[x].sender === this.state.username)) { // Check not out of bounds
        type = "receive"; // Set type
      } else if (this.state.transactions[x].recipient !== this.state.address && this.state.transactions[x].recipient !== this.state.username) { // Check is sending
        type = "send"; // Set send
      } else if ((this.state.transactions[x].recipient === this.state.address || this.state.transactions[x].recipient === this.state.username) && this.state.transactions[x].sender !== this.state.address && this.state.transactions[x].sender !== this.state.username) { // Check is receiving
        type = "receive"; // Set receive
      }

      var payload = "";

      if (this.state.transactions[x].payload) { // Check has payload
        payload = atob(this.state.transactions[x].payload); // Decode payload
      }

      var max = 13; // Get max substring

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
