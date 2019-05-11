import React, { Component } from "react"; // Import react
import { Grommet, Form, FormField, Button } from "grommet"; // Import grommet
import { theme } from "./SummerTechTheme"; // Import SummerTech theme
import { withRouter } from "react-router-dom"; // Import router

class Support extends Component {
  render() {
    return (
      <Grommet theme={theme} full>
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

    this.props.history.push(
      `mailto:info@summertech.net?subject=${event.value.subject}&body=${
        event.value.body
      }`
    ); // "Send"
  }
}

export default withRouter(Support); // Force use router
