import React, { Component } from 'react'
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Box, Form, FormField, TextInput, Button } from 'grommet'; // Import grommet
import Cookies from 'universal-cookie'; // Import cookies

export default class AuthForm extends Component {
  constructor (props) {
    super(props); // Super props

    this.onSubmit = this.onSubmit.bind(this); // Bind onSubmit

    this.password_text_input = React.createRef(); // Create password input ref
  }

  render() {
    return (
      <Grommet theme={ theme }>
        <Box justify="center" align="center" fill={ true } basis="large">
          <Form onSubmit={ this.onSubmit }>
            <FormField name="name" label="Name" required={ true } size="xxlarge"/>
            <FormField ref="password_input" label="Password" required={ false } value="">
              <TextInput ref="password_text_input" type="password" name="password" label="Password" size="xxlarge"/>
            </FormField>
            <Button type="submit" primary label={ this.props.label } margin={{top: "small"}} color="accent-2" size="large"/>
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
      const cookies = new Cookies(); // Initialize cookies

      cookies.set('username', formData.name); // Set username
      cookies.set('password', formData.password); // Set password
      cookies.set('address', response.address); // Set address

      this.setState({
        username: cookies.get('username') || 'not-signed-in', // Get username cookie
        password: cookies.get('password') || 'not-signed-in', // Set password
        address: cookies.get('address') || 'not-signed-in', // Get address
      }) // Set state
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
      const cookies = new Cookies(); // Initialize cookies

      cookies.set('username', formData.name); // Set username
      cookies.set('password', formData.password); // Set password
      cookies.set('address', response.address); // Set address

      this.setState({
        username: cookies.get('username') || 'not-signed-in', // Get username cookie
        password: cookies.get('password') || 'not-signed-in', // Set password
        address: cookies.get('address') || 'not-signed-in', // Get address
      }) // Set state
    })
  }
}
