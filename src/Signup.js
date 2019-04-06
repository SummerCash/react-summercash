import React, { Component } from 'react'
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Box, Form, FormField, TextInput, Button } from 'grommet'; // Import grommet

export default class Signup extends Component {
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
            <Button type="submit" primary label="Sign Up" margin={{top: "small"}} color="accent-2" size="large"/>
          </Form>
        </Box>
      </Grommet>
    )
  }

  // onSubmit submits the sign up form.
  onSubmit (event) {
    event.preventDefault(); // Prevent default

    var formData = event.value; // Get form data
    formData.password = this.refs.password_text_input.value; // Get password

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
      console.log(response); // Log response
    })
  }
}
