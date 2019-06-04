import React, { Component } from "react"; // Import react
import { Grommet, Form, FormField, Button, Box } from "grommet"; // Import grommet
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
        <Box justify="center" align="center" fill="vertical" responsive={true}>
          <Form onSubmit={this.send}>
            <FormField name="subject" label="Subject" size={size} pad={true} />
            <FormField name="body" label="Body" size={size} pad={true} />
            <Button
              type="submit"
              primary
              label="Submit"
              size="large"
              color="accent-2"
              margin={{ top: "small" }}
            />
          </Form>
        </Box>
      </Grommet>
    );
  }

  // send email.
  send(event) {
    event.preventDefault(); // Prevent default

    this.successAlert("Your message has been sent!"); // Alert send message

    setTimeout(() => {
      this.props.history.push("/"); // Go back to home
    }, 5000);
  }
}

export default withRouter(Support); // Force use router
