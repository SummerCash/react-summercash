import React, { Component } from 'react'
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Box, Form, FormField, TextInput, Button } from 'grommet'; // Import grommet
import Cookies from 'universal-cookie'; // Import cookies
import { withRouter } from 'react-router-dom'; // Import router
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styling

class AuthForm extends Component {
  errorAlert = (message) => toast.error(message); // Alert

  constructor (props) {
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

        this.props.history.push("/"); // Go to app
      })
    }

    this.onSubmit = this.onSubmit.bind(this); // Bind onSubmit

    this.password_text_input = React.createRef(); // Create password input ref
  }

  render() {
    var size = "xxlarge"; // Init size

    if (window.innerWidth < 432) { // Check too small
      size = "large"; // Set size
    } else if (window.innerWidth < 402) { // Check even smaller
      size = "medium"; // Set size
    }
    
    return (
      <Grommet theme={ theme } full={ true }>
        <ToastContainer/>
        <Box justify="center" align="center" fill="vertical" responsive={ true }>
          <Form onSubmit={ this.onSubmit }>
            <FormField name="name" label="Name" required={ true } size={ size } pad={ true }/>
            <FormField ref="password_input" label="Password" required={ false } value="" pad={ true }>
              <TextInput ref="password_text_input" type="password" name="password" label="Password" size={ size }/>
            </FormField>
            <Button type="submit" onClick={ this.alert } primary label={ this.props.label } margin={{ top: "small" }} color="accent-2" size="large"/>
          </Form>
        </Box>
      </Grommet>
    )
  }

  // onSubmit submits the auth form.
  onSubmit (event) {
    event.preventDefault(); // Prevent default

    var formData = event.value; // Get form data
    formData.password = this.refs.password_text_input.value; // Get password

    if (this.props.label === "Sign Up") { // Check is create account form
      this.onSubmitCreate(formData); // Submit create
    } else {
      this.onSubmitAuth(formData); // Submit auth
    }
  }

  // onSubmitCreate is the onSubmit event for a Sign Up form.
  onSubmitCreate (formData) {
    fetch("/api/accounts/"+formData.name, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: formData.password,
      })
    }).then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert
      } else {
        const cookies = new Cookies(); // Initialize cookies

        cookies.set('username', formData.name); // Set username
        cookies.set('password', formData.password); // Set password
        cookies.set('address', response.address); // Set address

        this.setState({
          username: cookies.get('username') || 'not-signed-in', // Get username cookie
          password: cookies.get('password') || 'not-signed-in', // Set password
          address: cookies.get('address') || 'not-signed-in', // Get address
        }) // Set state

        this.props.history.push("/"); // Go to app
      }
    })
  }

  // onSubmitAuth is the onSubmit event for a Log In form.
  onSubmitAuth (formData) {
    fetch("/api/accounts/"+formData.name+"/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: formData.password,
      })
    }).then((response) => response.json())
    .then(response => {
      if (response.error) { // Check for errors
        this.errorAlert(response.error); // Alert with error
      } else {
        const cookies = new Cookies(); // Initialize cookies

        cookies.set('username', formData.name); // Set username
        cookies.set('password', formData.password); // Set password
        cookies.set('address', response.address); // Set address

        this.setState({
          username: cookies.get('username') || 'not-signed-in', // Get username cookie
          password: cookies.get('password') || 'not-signed-in', // Set password
          address: cookies.get('address') || 'not-signed-in', // Get address
        }) // Set state

        this.props.history.push("/"); // Go to app
      }
    })
  }
}

export default withRouter(AuthForm); // Force use router