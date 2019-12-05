import React from 'react'
import styled,{keyframes} from 'styled-components';

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

const BeaconComponent = props => <Beacon {...props} />;

export default BeaconComponent;
