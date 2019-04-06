import React, { Component } from 'react'
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Box, Form, FormField, TextInput } from 'grommet'; // Import grommet

export default class Signup extends Component {
  render() {
    return (
      <Grommet theme={ theme }>
        <Box justify="center" align="center" fill={ true } basis="large">
          <Form>
            <FormField name="name" label="Name" required={ true }/>
            <TextInput type="password" name="password" label="Password"/>
          </Form>
        </Box>
      </Grommet>
    )
  }
}
