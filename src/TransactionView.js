import React, { Component } from "react";
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Paragraph, Box } from 'grommet';
import { SubtractCircle } from 'grommet-icons'; // Import grommet icons

export default class TransactionView extends Component {
  render() {
    if (this.props.type === "send") { // Check is send
      return (
        <Grommet theme={ theme }>
          <Box direction="row-responsive" align="center" margin={ this.props.margin } gap={ this.props.gap }>
            <SubtractCircle/>
            <Paragraph responsive={ true }>
              { this.props.timestamp }
            </Paragraph>
            <Paragraph responsive={ true }>
              Sent { this.props.amount } SMC
            </Paragraph>
            <Paragraph responsive={ true }>
              { this.props.hash }
            </Paragraph>
          </Box>
        </Grommet>
      );
    } else {
      return;
    }
  }
}
