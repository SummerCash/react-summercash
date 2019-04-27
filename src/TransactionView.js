import React, { Component } from "react";
import { theme } from './SummerTechTheme'; // Import SummerTech theme
import { Grommet, Paragraph, Grid } from 'grommet';
import { SubtractCircle, AddCircle } from 'grommet-icons'; // Import grommet icons
import Media from "react-media";

export default class TransactionView extends Component {
  render() {
    if (this.props.type === "send") { // Check is send
      return (
        <Grommet theme={ theme }>
          <Media query="(min-width:626px)">
            { matches => 
              matches ? (
                <Grid rows={["xxsmall"]} columns={[ "xxsmall", "16%", "medium", "medium" ]} align="center" margin={{ top: this.props.margin }}>
                  <SubtractCircle/>
                  <Paragraph responsive={ true } textAlign="start">
                    { this.props.timestamp }
                  </Paragraph>
                  <Paragraph responsive={ true } textAlign="start" margin={{ right: this.props.gap }}>
                    Sent { this.props.amount } SMC to { this.props.recipient }
                  </Paragraph>
                  <Paragraph responsive={ true } textAlign="start">
                    { this.props.message }
                  </Paragraph>
                </Grid>
              ) : (
                <Grid rows={["xxsmall"]} columns={[ "xxsmall", "10%", "medium", "small" ]} align="center" fill="horizontal" margin={{ top: this.props.margin }}>
                  <SubtractCircle/>
                  <Paragraph responsive={ true } textAlign="start">
                    { this.props.shortTimestamp }
                  </Paragraph>
                  <Media query="(min-width:432px)">
                    { matches =>
                      matches ? (
                        <Paragraph responsive={ true } textAlign="center">
                          { this.props.amount } SMC to { this.props.recipient }
                        </Paragraph>
                      ) : (
                        <Paragraph responsive={ true } textAlign="center" margin={{ left: "-5%" }}>
                          { this.props.amount } SMC to { this.props.recipient }
                        </Paragraph>
                      )
                    }
                  </Media>
                  <Media query="(min-width:530px)">
                    <Paragraph responsive={ true } textAlign="start" margin={{ left: "-20%" }}>
                      { this.props.message }
                    </Paragraph>
                  </Media>
                </Grid>
              )
            }
          </Media>
        </Grommet>
      );
    } else {
      return (
        <Grommet theme={ theme }>
          <Media query="(min-width:626px)">
            { matches => 
              matches ? (
                <Grid rows={["xxsmall"]} columns={[ "xxsmall", "16%", "medium", "medium" ]} align="center" margin={{ top: this.props.margin }}>
                  <AddCircle/>
                  <Paragraph responsive={ true } textAlign="start">
                    { this.props.timestamp }
                  </Paragraph>
                  <Paragraph responsive={ true } textAlign="start" margin={{ right: this.props.gap }}>
                    Received { this.props.amount } SMC from { this.props.sender }
                  </Paragraph>
                  <Paragraph responsive={ true } textAlign="start">
                    { this.props.message }
                  </Paragraph>
                </Grid>
              ) : (
                <Grid rows={["xxsmall"]} columns={[ "xxsmall", "10%", "medium", "small" ]} align="center" fill="horizontal" margin={{ top: this.props.margin }}>
                  <AddCircle/>
                  <Paragraph responsive={ true } textAlign="start">
                    { this.props.shortTimestamp }
                  </Paragraph>
                  <Media query="(min-width:432px)">
                    { matches =>
                      matches ? (
                        <Paragraph responsive={ true } textAlign="center">
                          { this.props.amount } SMC from { this.props.sender }
                        </Paragraph>
                      ) : (
                        <Paragraph responsive={ true } textAlign="center" margin={{ left: "-15%" }}>
                          { this.props.amount } SMC from { this.props.sender }
                        </Paragraph>
                      )
                    }
                  </Media>
                  <Media query="(min-width:530px)">
                    <Paragraph responsive={ true } textAlign="start" margin={{ left: "-20%" }}>
                      { this.props.message }
                    </Paragraph>
                  </Media>
                </Grid>
              )
            }
          </Media>
        </Grommet>
      );
    }
  }
}
