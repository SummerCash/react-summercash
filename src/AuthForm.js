import React, { Component } from "react";
import { theme } from "./SummerTechTheme"; // Import SummerTech theme
import { Grommet, Box, Form, FormField, TextInput, Button } from "grommet"; // Import grommet
import Cookies from "universal-cookie"; // Import cookies
import { withRouter } from "react-router-dom"; // Import router
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styling
import CircularProgress from "@material-ui/core/CircularProgress"; // Import progress

class AuthForm extends Component {
  errorAlert = message => toast.error(message); // Alert

  constructor(props) {
    super(props); // Super props

    const cookies = new Cookies(); // Initialize cookies

    const username = cookies.get("username"); // Get username

    this.onSubmit = this.onSubmit.bind(this); // Bind this
    this.onSubmitAuth = this.onSubmitAuth.bind(this); // Bind this
    this.onSubmitCreate = this.onSubmitCreate.bind(this); // Bind this

    this.state = {
      isSigningIn: false
    }; // Set state

    if (
      username !== undefined &&
      username !== "" &&
      username !== "not-signed-in"
    ) {
      // Check already signed in
      fetch(
        "https://summer.cash/api/accounts/" +
          cookies.get("username") +
          "/authenticatetoken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: cookies.get("token") // Set token
          })
        }
      )
        .then(response => response.json())
        .then(response => {
          if (response.error) {
            // Check no error
            this.errorAlert(response.error); // Show error

            return; // Return
          }

          cookies.set("address", response.address); // Set address

          this.setState({
            username: username, // Set username cookie
            address: response.address // Set address
          }); // Set state

          this.props.history.push("/"); // Go to app
        });
    }

    this.onSubmit = this.onSubmit.bind(this); // Bind onSubmit

    this.password_text_input = React.createRef(); // Create password input ref
  }

  render() {
    var size = "xxlarge"; // Init size

    if (window.innerWidth < 432) {
      // Check too small
      size = "large"; // Set size
    } else if (window.innerWidth < 402) {
      // Check even smaller
      size = "medium"; // Set size
    }

    return (
      <Grommet theme={theme} full={true}>
        <ToastContainer />
        <Box justify="center" align="center" fill="vertical" responsive={true}>
          {!this.state.isSigningIn ? (
            <Form onSubmit={this.onSubmit}>
              <FormField
                name="name"
                label="Username"
                required={true}
                size={size}
                pad={true}
              />
              <FormField
                ref="password_input"
                label="Password"
                required={false}
                value=""
                pad={true}
              >
                <TextInput
                  ref="password_text_input"
                  type="password"
                  name="password"
                  label="Password"
                  size={size}
                />
              </FormField>
              <Button
                type="submit"
                onClick={this.alert}
                primary
                label={this.props.label}
                margin={{ top: "small" }}
                color="accent-2"
                size="large"
              />
            </Form>
          ) : (
            <CircularProgress />
          )}
        </Box>
      </Grommet>
    );
  }

  // onSubmit submits the auth form.
  onSubmit(event) {
    this.setState({ isSigningIn: true }); // Set state

    event.preventDefault(); // Prevent default

    var formData = event.value; // Get form data
    formData.password = this.refs.password_text_input.value; // Get password

    if (this.props.label === "Sign Up") {
      // Check is create account form
      this.onSubmitCreate(formData); // Submit create
    } else {
      this.onSubmitAuth(formData); // Submit auth
    }
  }

  // onSubmitCreate is the onSubmit event for a Sign Up form.
  onSubmitCreate(formData) {
    if (formData.name.length > 24 || formData.name === "everyone") {
      // Check username too long

      this.errorAlert("Invalid username."); // Show error

      this.setState({ isSigningIn: false }); // Remove loading indicator

      return; // Return
    }
    fetch("https://summer.cash/api/accounts/" + formData.name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: formData.password
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          // Check for errors
          this.errorAlert(response.error); // Alert

          this.setState({ isSigningIn: false }); // Set state

          return; // Return
        }

        fetch("https://summer.cash/api/accounts/" + formData.name + "/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            password: formData.password
          })
        })
          .then(tokenResponse => tokenResponse.json())
          .then(tokenResponse => {
            if (tokenResponse.error) {
              // Check for errors
              this.errorAlert(tokenResponse.error); // Alert

              this.setState({ isSigningIn: false }); // Set state

              return; // Return
            }

            const cookies = new Cookies(); // Initialize cookies

            cookies.set("username", formData.name); // Set username
            cookies.set("token", tokenResponse.token); // Set token
            cookies.set("address", tokenResponse.address); // Set address

            if (window.isElectron) {
              // Check is electron
              window.ipcRenderer.send(
                "sign_in",
                JSON.stringify({
                  username: formData.name,
                  token: response.token,
                  address: response.address
                })
              ); // Send details to main process
            }

            this.setState({
              username: cookies.get("username") || "not-signed-in", // Get username cookie
              token: cookies.get("token") || "not-signed-in", // Set token
              address: cookies.get("address") || "not-signed-in" // Get address
            }); // Set state

            this.props.history.push("/"); // Go to app
          });
      });
  }

  // onSubmitAuth is the onSubmit event for a Log In form.
  onSubmitAuth(formData) {
    fetch("https://summer.cash/api/accounts/" + formData.name + "/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: formData.password
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response.error) {
          // Check for errors
          this.errorAlert(response.error); // Alert with error

          return; // Return
        }

        const cookies = new Cookies(); // Get cookies

        cookies.set("token", response.token); // Set token cookie
        cookies.set("address", response.address); // Set address cookie
        cookies.set("username", formData.name); // Set username cookie

        this.setState({
          username: formData.name,
          token: response.token,
          address: response.address
        }); // Set state

        if (window.isElectron) {
          window.ipcRenderer.send(
            // Check is electron
            "sign_in",
            JSON.stringify({
              username: formData.name,
              token: response.token,
              address: response.address
            })
          ); // Send details to main process
        }

        this.props.history.push("/"); // Go to app
      });
  }
}

export default withRouter(AuthForm); // Force use router
