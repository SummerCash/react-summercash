import React, { Component } from "react"; // Import react
import { Grommet, Form, FormField, Button, Box } from "grommet"; // Import grommet
import { theme } from "./SummerTechTheme"; // Import SummerTech theme
import { withRouter } from "react-router-dom"; // Import router
import { ToastContainer, toast } from "react-toastify"; // Import toast

class Support extends Component {
  successAlert = message => toast.success(message); // Alert

  render() {
    return (
      <Grommet theme={theme} full>
        <ToastContainer />
        <Box align="center" fill="vertical" justify="center" basis="large" />
        <Form onSubmit={this.send}>
          <FormField name="subject" label="Subject" />
          <FormField name="body" label="Body" />
          <Button type="submit" primary label="Submit" />
        </Form>
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
