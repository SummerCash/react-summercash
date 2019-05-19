import React, { Component } from "react"; // Import react
import { Grommet, Form, FormField, Button, Box, Heading } from "grommet"; // Import grommet
import { theme } from "./SummerTechTheme"; // Import SummerTech theme
import { withRouter } from "react-router-dom"; // Import router
import { ToastContainer, toast } from "react-toastify"; // Import toast

class Support extends Component {
  constructor(props) {
    super(props); // Super

    this.send = this.send.bind(this); // Bind this
  }

  successAlert = message => toast.success(message); // Alert

  render() {
    const size = "xlarge"; // Lol I couldn't care less

    return (
      <Grommet theme={theme} full>
        <ToastContainer />
        <Box align="center" fill="vertical" justify="center" basis="large">
          <Heading
            responsive={true}
            size="medium"
            margin="none"
            textAlign="start"
          >
            Support
          </Heading>
          <Form onSubmit={this.send}>
            <FormField name="subject" label="Subject" size={size} />
            <FormField name="body" label="Body" size={size} />
            <Button type="submit" primary label="Submit" size="large" />
          </Form>
        </Box>
      </Grommet>
    );
  }

  // send email.
  send(event) {
    event.preventDefault(); // Prevent default

    this.successAlert("Your message has been sent!"); // Alert send message
  }
}

export default withRouter(Support); // Force use router
