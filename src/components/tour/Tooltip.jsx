import React from 'react'
import styled from 'styled-components';
import { FormattedMessage } from "react-intl";

const TooltipBody = styled.div`
  background-color: #daa588;
  min-width: 290px;
  max-width: 420px;
  padding-bottom: 3rem;
`;

const TooltipContent = styled.div`
  color: #fff;
  padding: 20px;
`;

const TooltipTitle = styled.h2`
  color: #fff;
  padding: 20px;
  margin: 0;
`;

const TooltipFooter = styled.div`
  background-color: #f56960;
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;

  * + * {
    margin-left: 0.5rem;
  }
`;

const Button = styled.button`
  background-color: #e11b0e;
  color: #fff;
`;

const Tooltip = ({
  continuous,
  backProps,
  closeProps,
  index,
  primaryProps,
  setTooltipRef,
  step
}) => (
  <TooltipBody ref={setTooltipRef}>
    {step.title && <TooltipTitle>{step.title}</TooltipTitle>}
    {step.content && <TooltipContent>{step.content}</TooltipContent>}
    <TooltipFooter>
      {index > 0 && (
        <Button {...backProps}>
          <FormattedMessage id="back" />
        </Button>
      )}
      {continuous && (
        <Button {...primaryProps}>
          <FormattedMessage id="next" />
        </Button>
      )}
      {!continuous && (
        <Button {...closeProps}>
          <FormattedMessage id="close" />
        </Button>
      )}
    </TooltipFooter>
  </TooltipBody>
);

export default Tooltip
