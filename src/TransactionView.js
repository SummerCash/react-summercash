import React, { Component } from "react";
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Paragraph, Box, Grid } from 'grommet';
import { SubtractCircle, AddCircle } from 'grommet-icons'; // Import grommet icons

export default class TransactionView extends Component {
  render() {
    if (this.props.type === "send") { // Check is send
      return (
        <Grommet theme={ theme }>
          <Grid rows={["xxsmall"]} columns={[ "xxsmall", "16%", "medium", "medium" ]} align="center">
            <SubtractCircle/>
            <Paragraph responsive={ true } textAlign="start">
              { this.props.timestamp }
            </Paragraph>
            <Paragraph responsive={ true } textAlign="center" margin={{ right: this.props.gap }}>
              Sent { this.props.amount } SMC to { this.props.recipient }
            </Paragraph>
            <Paragraph responsive={ true } textAlign="start">
              { this.props.message }
            </Paragraph>
          </Grid>
        </Grommet>
      );
    } else {
      return (
        <Grommet theme={ theme }>
          <Grid rows={["xxsmall"]} columns={[ "xxsmall", "16%", "medium", "medium" ]} align="center">
            <AddCircle/>
            <Paragraph responsive={ true } textAlign="start">
              { this.props.timestamp }
            </Paragraph>
            <Paragraph responsive={ true } textAlign="center" margin={{ right: this.props.gap }}>
              Received { this.props.amount } SMC from { this.props.sender }
            </Paragraph>
            <Paragraph responsive={ true } textAlign="start">
              { this.props.message }
            </Paragraph>
          </Grid>
        </Grommet>
      );
    }
  }
}
