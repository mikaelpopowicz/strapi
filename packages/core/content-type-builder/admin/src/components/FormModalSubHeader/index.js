import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import upperFirst from 'lodash/upperFirst';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';

import { getTrad } from '../../utils';

import getModalTitleSubHeader from './getModalTitleSubHeader';

const SubHeaderContainer = styled(Flex)`
  margin-bottom: 10px;
`;

const Subtitle = styled(Typography)`
  margin-top: 4px;
`;

const FormModalSubHeader = ({
  actionType,
  modalType,
  forTarget,
  kind,
  step,
  attributeType,
  attributeName,
  customField,
}) => {
  const { formatMessage } = useIntl();
  const intlLabel =
    modalType === 'customField'
      ? customField.intlLabel
      : { id: getTrad(`attribute.${attributeType}`) };

  return (
    <SubHeaderContainer direction="column" alignItems="flex-start">
      <Typography as="h2" variant="beta">
        {formatMessage(
          {
            id: getModalTitleSubHeader({
              actionType,
              forTarget,
              kind,
              step,
              modalType,
            }),
            defaultMessage: 'Add new field',
          },
          {
            type: upperFirst(formatMessage(intlLabel)),
            name: upperFirst(attributeName),
            step,
          }
        )}
      </Typography>
      <Subtitle variant="pi" textColor="neutral600">
        {formatMessage({
          id: getTrad(`attribute.${attributeType}.description`),
          defaultMessage: 'A type for modeling data',
        })}
      </Subtitle>
    </SubHeaderContainer>
  );
};

FormModalSubHeader.defaultProps = {
  actionType: null,
  modalType: null,
  forTarget: null,
  kind: null,
  step: null,
  attributeType: null,
  attributeName: null,
  customField: null,
};

FormModalSubHeader.propTypes = {
  actionType: PropTypes.string,
  modalType: PropTypes.string,
  forTarget: PropTypes.string,
  kind: PropTypes.string,
  step: PropTypes.string,
  attributeType: PropTypes.string,
  attributeName: PropTypes.string,
  customField: PropTypes.object,
};

export default FormModalSubHeader;
