import * as React from 'react';

import { Box, Flex, Grid, GridItem, Typography } from '@strapi/design-system';
import { Menu } from '@strapi/design-system/v2';
import { Cross, Drag, Pencil, Plus } from '@strapi/icons';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useIntl } from 'react-intl';
import styled from 'styled-components';

import { type UseDragAndDropOptions, useDragAndDrop } from '../../hooks/useDragAndDrop';
import { ItemTypes } from '../../utils/dragAndDrop';
import { useComposedRefs } from '../../utils/refs';
import { getTranslation } from '../../utils/translations';
import { useField, useForm } from '../Form';

import type { ConfigurationFormData } from './Form';
import type { Schema } from '../../hooks/useDocument';
import type { EditLayout } from '../../hooks/useDocumentLayout';

/* -------------------------------------------------------------------------------------------------
 * Fields
 * -----------------------------------------------------------------------------------------------*/

interface FieldsProps extends Pick<EditLayout, 'metadatas'> {
  attributes: Schema['attributes'];
}

const Fields = ({ attributes, metadatas = {} }: FieldsProps) => {
  const { formatMessage } = useIntl();

  const { layout } = useForm('Fields', (state) => state.values as ConfigurationFormData);

  const existingFields = layout.flat(3).map((field) => field.name);

  /**
   * Get the fields that are not already in the layout
   * But also check that they are visible before we give users
   * the option to display them. e.g. `id` is not visible.
   */
  const remainingFields = Object.keys(attributes).filter(
    (field) => !existingFields.includes(field) && metadatas[field]?.visible === true
  );

  const handleMoveField: FieldProps['onMoveField'] = (newIndex, currentIndex) => {
    console.log(newIndex, currentIndex);
  };

  return (
    <Flex paddingTop={6} direction="column" alignItems="stretch" gap={4}>
      <Flex justifyContent="space-between">
        <Typography fontWeight="bold">
          {formatMessage({
            id: getTranslation('containers.ListPage.displayedFields'),
            defaultMessage: 'Displayed fields',
          })}
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          {formatMessage({
            id: 'containers.SettingPage.editSettings.description',
            defaultMessage: 'Drag & drop the fields to build the layout',
          })}
        </Typography>
        {/* <LinkToCTB /> */}
      </Flex>
      <Box padding={4} hasRadius borderStyle="dashed" borderWidth="1px" borderColor="neutral300">
        <Flex direction="column" alignItems="stretch" gap={2}>
          {layout.map((row, rowIndex) => (
            <Grid gap={2} key={rowIndex}>
              {row.map(({ size, ...field }, fieldIndex) => (
                <GridItem key={field.name} col={size}>
                  <Field
                    index={[rowIndex, fieldIndex]}
                    name={`layout.${rowIndex}.${fieldIndex}`}
                    onMoveField={handleMoveField}
                  />
                </GridItem>
              ))}
            </Grid>
          ))}
          <Menu.Root>
            <Menu.Trigger
              startIcon={<Plus />}
              endIcon={null}
              disabled={remainingFields.length === 0}
              fullWidth
              variant="secondary"
            >
              {formatMessage({
                id: getTranslation('containers.SettingPage.add.field'),
                defaultMessage: 'Insert another field',
              })}
            </Menu.Trigger>
            <Menu.Content>
              {remainingFields.map((field) => (
                <Menu.Item
                  key={field}
                  onSelect={() => {
                    console.log('add field');
                  }}
                >
                  {field}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Root>
        </Flex>
      </Box>
    </Flex>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Field
 * -----------------------------------------------------------------------------------------------*/

interface FieldProps {
  index: [row: number, index: number];
  name: string;
  onMoveField: UseDragAndDropOptions<number[]>['onMoveItem'];
}

/**
 * Displays a field in the layout with drag options, also
 * opens a modal  to edit the details of said field.
 */
const Field = ({ name, index, onMoveField }: FieldProps) => {
  const { formatMessage } = useIntl();

  const { value, onChange } = useField<ConfigurationFormData['layout'][number][number]>(name);

  const [{ isDragging }, objectRef, dropRef, dragRef, dragPreviewRef] = useDragAndDrop<
    Array<number>
  >(true, {
    type: ItemTypes.EDIT_FIELD,
    item: { index, label: value?.label, name },
    index,
    onMoveItem: onMoveField,
  });

  React.useEffect(() => {
    dragPreviewRef(getEmptyImage(), { captureDraggingState: false });
  }, [dragPreviewRef]);

  const composedRefs = useComposedRefs<HTMLSpanElement>(dragRef, objectRef);

  const handleRemoveField = () => {
    onChange(name, undefined);
  };

  if (!value) {
    return null;
  }

  return (
    <>
      <FieldContainer
        borderColor="neutral150"
        background="neutral100"
        hasRadius
        justifyContent="space-between"
        pointerEvents={value.name === '_TEMP_' ? 'none' : 'auto'}
        style={{ opacity: value.name === '_TEMP_' ? 0 : isDragging ? 0.5 : 1 }}
        ref={dropRef}
        gap={3}
        //   onClick={() => setIsModalOpen(true)}
      >
        <Flex gap={3}>
          <DragButton
            as="span"
            aria-label={formatMessage(
              {
                id: getTranslation('components.DraggableCard.move.field'),
                defaultMessage: 'Move {item}',
              },
              { item: value.label }
            )}
            onClick={(e) => e.stopPropagation()}
            ref={composedRefs}
          >
            <Drag />
          </DragButton>
          <Typography fontWeight="bold">{value.label}</Typography>
        </Flex>
        <Flex>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              // setIsModalOpen(true);
            }}
            aria-label={formatMessage(
              {
                id: getTranslation('components.DraggableCard.edit.field'),
                defaultMessage: 'Edit {item}',
              },
              { item: value.label }
            )}
            type="button"
          >
            <Pencil />
          </ActionButton>
          <ActionButton
            onClick={handleRemoveField}
            aria-label={formatMessage(
              {
                id: getTranslation('components.DraggableCard.delete.field'),
                defaultMessage: 'Delete {item}',
              },
              { item: value.label }
            )}
            type="button"
          >
            <Cross />
          </ActionButton>
        </Flex>
      </FieldContainer>
      {/* {isModalOpen && (
        <EditFieldForm
          attribute={attribute}
          name={`layout.${index}`}
          onClose={() => setIsModalOpen(false)}
        />
      )} */}
    </>
  );
};

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.spaces[7]};

  &:last-child {
    padding: 0 ${({ theme }) => theme.spaces[3]};
  }
`;

const DragButton = styled(ActionButton)`
  padding: 0 ${({ theme }) => theme.spaces[3]};
  border-right: 1px solid ${({ theme }) => theme.colors.neutral150};
  cursor: all-scroll;

  svg {
    width: ${12 / 16}rem;
    height: ${12 / 16}rem;
  }
`;

const FieldContainer = styled(Flex)`
  max-height: ${32 / 16}rem;
  cursor: pointer;

  svg {
    width: ${10 / 16}rem;
    height: ${10 / 16}rem;

    path {
      fill: ${({ theme }) => theme.colors.neutral600};
    }
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary100};
    border-color: ${({ theme }) => theme.colors.primary200};

    svg {
      path {
        fill: ${({ theme }) => theme.colors.primary600};
      }
    }

    ${Typography} {
      color: ${({ theme }) => theme.colors.primary600};
    }

    ${DragButton} {
      border-right: 1px solid ${({ theme }) => theme.colors.primary200};
    }
  }
`;

export { Fields };
