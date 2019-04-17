import React, { Component } from "react";
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Paragraph, Box, Grid } from 'grommet';
import { SubtractCircle, AddCircle } from 'grommet-icons'; // Import grommet icons

export default class TransactionView extends Component {
  render() {
    if (this.props.type === "send") { // Check is send
      return (
        <Grommet theme={ theme }>
          <Grid rows={["xxsmall"]} columns={[ "xxsmall", "19%", "small", "small" ]} align="center">
            <SubtractCircle/>
            <Paragraph responsive={ true } textAlign="start" margin={{ right: this.props.gap }}>
              { this.props.timestamp }
            </Paragraph>
            <Paragraph responsive={ true } textAlign="end">
              Sent { this.props.amount } SMC
            </Paragraph>
            <Paragraph responsive={ true }>
              to { this.props.recipient }
            </Paragraph>
          </Grid>
        </Grommet>
      );
    } else {
      return (
        <Grommet theme={ theme }>
          <Box direction="row-responsive" align="center" margin={{ left: this.props.margin, top: "none" }} gap={ this.props.gap }>
            <AddCircle/>
            <Paragraph responsive={ true }>
              { this.props.timestamp }
            </Paragraph>
            <Paragraph responsive={ true }>
              Received { this.props.amount } SMC
            </Paragraph>
            <Paragraph responsive={ true } alignSelf="end" textAlign="end">
              from { this.props.sender }
            </Paragraph>
          </Box>
        </Grommet>
      );
    }
  }
}
