import React from 'react';
import Joyride, {ACTIONS, EVENTS, STATUS} from 'react-joyride';
import {startTour, endTour, pauseTour, continueTour, updateStepIndex, updateAllowToRun} from '../reducers/tour';
import {connect} from 'react-redux'
import styled, {keyframes} from "styled-components";

const pulse = keyframes`
  0% {
    transform: scale(1);
  }

  55% {
    background-color: rgba(255, 100, 100, 0.9);
    transform: scale(1.6);
  }
`;

const Beacon = styled.span`
  animation: ${pulse} 1s ease-in-out infinite;
  background-color: rgba(255, 27, 14, 0.6);
  border-radius: 50%;
  display: inline-block;
  height: 2rem;
  width: 2rem;
`;

const Loading = styled.div`
    color: #fff;
    font-size: 3rem;
    font-weight: bold;
    left: 50%;
    position: fixed;
    top: 50%;
    text-align: center;
    transform: translate(-50%, -50%);
    margin: 20px;
    background-color: rgba(255, 27, 14, 0.6);
    border-radius: 50%;
`

const BeaconComponent = props => <Beacon {...props} />;

// const TooltipBody = styled.div`
//   background-color: #daa588;
//   min-width: 290px;
//   max-width: 420px;
//   padding-bottom: 3rem;
// `;
//
// const TooltipContent = styled.div`
//   color: #fff;
//   padding: 20px;
// `;
//
// const TooltipTitle = styled.h2`
//   color: #fff;
//   padding: 20px;
//   margin: 0;
// `;
//
// const TooltipFooter = styled.div`
//   background-color: #f56960;
//   display: flex;
//   justify-content: flex-end;
//   margin-top: 1rem;
//
//   * + * {
//     margin-left: 0.5rem;
//   }
// `;
//
// const Button = styled.button`
//   background-color: #e11b0e;
//   color: #fff;
// `
//
// const Input = styled.input`
//   padding: 1.2rem;
//   width: 75%;
// `;
//
// const Tooltip = ({
//                      continuous,
//                      backProps,
//                      closeProps,
//                      index,
//                      primaryProps,
//                      setTooltipRef,
//                      step
//                  }) => (
//     <TooltipBody ref={setTooltipRef}>
//         {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
//         {step.content && <TooltipContent>{step.content}</TooltipContent>}
//         <TooltipFooter>
//             {index > 0 && (
//                 <Button {...backProps}>
//                     <FormattedMessage id="back" />
//                 </Button>
//             )}
//             {continuous && (
//                 <Button {...primaryProps}>
//                     <FormattedMessage id="next" />
//                 </Button>
//             )}
//             {!continuous && (
//                 <Button {...closeProps}>
//                     <FormattedMessage id="close" />
//                 </Button>
//             )}
//         </TooltipFooter>
//     </TooltipBody>
// );

const TourHOC = function (WrappedComponent) {
    class TourWrapper extends React.Component {
        constructor(props) {
            super(props);
            this.handleJoyrideCallback = this.handleJoyrideCallback.bind(this)
        }

        componentDidMount() {
            const { updateAllowToRun, startTour} = this.props;
            let startTourInterval = setInterval(
                () => {
                    const {vmStarted} = this.props;
                    console.log("vmStarted checking...")
                    if (vmStarted) {
                        console.log("vmStarted")
                        updateAllowToRun(true)
                        startTour()
                        clearInterval(startTourInterval)
                    }
                }, 2000
            )
        }

        handleJoyrideCallback(data) {
            const {action, index, status, type} = data;
            const {latestBlock, updateStepIndex, continueTour, pauseTour, endTour} = this.props;
            if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) && this.props.run) {
                // Need to set our running state to false, so we can restart if we click start again.
                endTour();
            } else if (type === EVENTS.STEP_AFTER && index === 0) {
                pauseTour();

                let intervalToDragAndDrop = setInterval(() => {
                    if (latestBlock) {
                        continueTour(index + (action === ACTIONS.PREV ? -1 : 1));
                        clearInterval(intervalToDragAndDrop);
                    }
                }, 1500);
            } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
                // Update state to advance the tour
                updateStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
            } else if (type === EVENTS.TOOLTIP_CLOSE) {
                updateStepIndex(index + 1);
            }


            console.groupCollapsed(type);
            console.log(data); //eslint-disable-line no-console
            console.groupEnd();
        };

        render() {
            const {vmStarted, allowToRun, run, stepIndex, steps, tourAwaiting, shouldAddTour, latestBlock, updateStepIndex, continueTour, pauseTour, endTour, updateAllowToRun, startTour, ...props} = this.props;
            return (
                <React.Fragment>
                    <WrappedComponent {...props}/>
                    {(tourAwaiting && <Loading>
                        Drag and drop
                    </Loading>)}
                    ({shouldAddTour ?
                        <Joyride steps={steps} run={run} callback={this.handleJoyrideCallback} stepIndex={stepIndex}
                         disableOverlay={false} continuous={true}
                         styles={{
                             options: {
                                 arrowColor: '#e3ffeb',
                                 backgroundColor: '#e3ffeb',
                                 overlayColor: 'rgba(79, 26, 0, 0.4)',
                                 primaryColor: '#000',
                                 textColor: '#004a14',
                                 width: 900,
                                 zIndex: 1000,
                             }
                         }}
                         showSkipButton
                /> : null})
                </React.Fragment>
            );
        }
    }

    const mapStateToProps = state => ({
        vmStarted: state.scratchGui.vmStatus.started,
        shouldAddTour: state.scratchGui.tour.shouldAddTour,
        allowToRun: state.scratchGui.tour.allowToRun,
        run: state.scratchGui.tour.run,
        stepIndex: state.scratchGui.tour.stepIndex,
        steps: state.scratchGui.tour.steps,
        tourAwaiting: state.scratchGui.tour.tourAwaiting,
        latestBlock: state.scratchGui.tour.latestBlock
    })
    const mapDispatchToProps = dispatch => ({
        startTour: () => dispatch(startTour()),
        endTour: () => dispatch(endTour()),
        pauseTour: () => dispatch(pauseTour()),
        continueTour: (index) => dispatch(continueTour(index)),
        updateStepIndex: (index) => dispatch(updateStepIndex(index)),
        updateAllowToRun: (allowToRun) => dispatch(updateAllowToRun(allowToRun))
    })

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(TourWrapper)
};

export default TourHOC

