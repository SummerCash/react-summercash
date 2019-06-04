import React, { Component } from "react"; // Import react
import { theme } from "./SummerTechTheme"; // Import SummerTech theme
import { withRouter } from "react-router-dom"; // Import router
import { Grommet, Heading, Button } from "grommet"; // Import Grommet
import { ToastContainer } from "react-toastify"; // Import toast
import Cookies from "universal-cookie";

class Settings extends Component {
  constructor(props) {
    super(props); // Super props

    const cookies = new Cookies(); // Get cookies provider

    if (
      cookies.get("username") === undefined ||
      !cookies.get("username") ||
      cookies.get("username") === null ||
      cookies.get("username") === "not-signed-in"
    ) {
      // Check not signed in
      this.props.history.push("/"); // Go to home
    }

    this.signOut = this.signOut.bind(this); // Bind this
  }

  render() {
    return (
      <Grommet theme={theme}>
        <ToastContainer />
        <Heading
          responsive={true}
          size="medium"
          margin={{ top: "large", left: "large" }}
        >
          Settings
        </Heading>
        <Button
          primary
          label="Sign Out"
          margin={{ top: "small", left: "large" }}
          color="accent-2"
          onClick={this.signOut}
          responsive={true}
          type="button"
        />
      </Grommet>
    );
  }

  signOut() {
    const cookies = new Cookies(); // Get cookies provider

    cookies.set("username", undefined); // Remove username cookie
    cookies.set("password", undefined); // Remove passwoord cookie
    cookies.set("address", undefined); // Remove address cookie

    this.props.history.push("/"); // Go to home
  }
}

export default withRouter(Settings); // Force use router
