import * as React from 'react';

import {
  Button,
  ContentLayout,
  Divider,
  Flex,
  Grid,
  GridItem,
  HeaderLayout,
  Layout,
  Main,
  Typography,
} from '@strapi/design-system';
import { Link } from '@strapi/design-system/v2';
import { ArrowLeft } from '@strapi/icons';
import pipe from 'lodash/fp/pipe';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { capitalise } from '../../../utils/strings';
import { useDoc } from '../../hooks/useDocument';
import { getTranslation } from '../../utils/translations';
import { Form, FormProps, useForm } from '../Form';
import { InputRenderer } from '../FormInputs/Renderer';

import { Fields } from './Fields';

import type { EditFieldLayout, EditLayout } from '../../hooks/useDocumentLayout';

/* -------------------------------------------------------------------------------------------------
 * ConfigurationForm
 * -----------------------------------------------------------------------------------------------*/

interface ConfigurationFormProps {
  layout: EditLayout;
}

/**
 * Every key in EditFieldLayout is turned to optional never and then we overwrite the ones we are using.
 */

type EditFieldSpacerLayout = {
  [key in keyof Omit<EditFieldLayout, 'name' | 'size'>]?: never;
} & {
  name: '_TEMP_';
  size: number;
};

interface ConfigurationFormData extends Pick<EditLayout, 'settings'> {
  layout: Array<Array<EditFieldLayout | EditFieldSpacerLayout>>;
}

const ConfigurationForm = ({ layout: editLayout }: ConfigurationFormProps) => {
  const { schema } = useDoc();
  const { components, settings, layout, metadatas } = editLayout;

  const { formatMessage } = useIntl();

  const initialValues: ConfigurationFormData = React.useMemo(() => {
    const transformations = pipe(addTmpSpaceToLayout, flattenPanels);

    return {
      layout: transformations(layout),
      settings,
    };
  }, [layout, settings]);

  const handleSubmit: FormProps<ConfigurationFormData>['onSubmit'] = () => {
    console.log('submitted!');
  };

  return (
    <Layout>
      <Main>
        <Form initialValues={initialValues} onSubmit={handleSubmit} method="PUT">
          <Header name={settings.displayName ?? ''} />
          <ContentLayout>
            <Flex
              alignItems="stretch"
              background="neutral0"
              direction="column"
              gap={6}
              hasRadius
              shadow="tableShadow"
              paddingTop={6}
              paddingBottom={6}
              paddingLeft={7}
              paddingRight={7}
            >
              <Typography variant="delta" as="h2">
                {formatMessage({
                  id: getTranslation('containers.SettingPage.settings'),
                  defaultMessage: 'Settings',
                })}
              </Typography>
              <Grid>
                <GridItem col={6} s={12}>
                  <InputRenderer
                    type="enumeration"
                    label={formatMessage({
                      id: getTranslation('containers.SettingPage.editSettings.entry.title'),
                      defaultMessage: 'Entry title',
                    })}
                    hint={formatMessage({
                      id: getTranslation(
                        'containers.SettingPage.editSettings.entry.title.description'
                      ),
                      defaultMessage: 'Set the display field of your entry',
                    })}
                    name="settings.mainField"
                    options={Object.entries(schema?.attributes ?? {}).reduce<
                      Array<{ label: string; value: string }>
                    >((acc, [key, attribute]) => {
                      /**
                       * Create the list of attributes from the schema as to which can
                       * be our `mainField` and dictate the display name of the schema
                       * we're editing.
                       */
                      if (!ATTRIBUTE_TYPES_THAT_CANNOT_BE_MAIN_FIELD.includes(attribute.type)) {
                        acc.push({
                          label: key,
                          value: key,
                        });
                      }

                      return acc;
                    }, [])}
                  />
                </GridItem>
                <GridItem paddingTop={6} paddingBottom={6} col={12} s={12}>
                  <Divider />
                </GridItem>
                <GridItem col={12} s={12}>
                  <Typography variant="delta" as="h3">
                    {formatMessage({
                      id: getTranslation('containers.SettingPage.view'),
                      defaultMessage: 'View',
                    })}
                  </Typography>
                </GridItem>
                <GridItem col={12} s={12}>
                  <Fields attributes={schema?.attributes ?? {}} metadatas={metadatas} />
                </GridItem>
              </Grid>
            </Flex>
          </ContentLayout>
        </Form>
      </Main>
    </Layout>
  );
};

/**
 * List of attribute types that cannot be used as the main field.
 * Not sure the name could be any clearer.
 */
const ATTRIBUTE_TYPES_THAT_CANNOT_BE_MAIN_FIELD = [
  'dynamiczone',
  'json',
  'text',
  'relation',
  'component',
  'boolean',
  'media',
  'password',
  'richtext',
  'timestamp',
  'blocks',
];

/**
 * @internal
 * @description Each row of the layout has a max size of 12 (based on bootstrap grid system)
 * So in order to offer a better drop zone we add the _TEMP_ div to complete the remaining substract (12 - existing)
 */
const addTmpSpaceToLayout = (
  layout: EditLayout['layout']
): Array<ConfigurationFormData['layout']> =>
  layout.map((panel) =>
    panel.map((row) => {
      const totalSpaceTaken = row.reduce((acc, field) => acc + field.size, 0);

      if (totalSpaceTaken < 12) {
        return [
          ...row,
          {
            name: '_TEMP_' as const,
            size: 12 - totalSpaceTaken,
          } satisfies EditFieldSpacerLayout,
        ];
      }

      return row;
    })
  );

/**
 * @internal
 * @description Panels don't exist in the layout, so we flatten by one.
 */
const flattenPanels = (
  layout: Array<ConfigurationFormData['layout']>
): ConfigurationFormData['layout'] => layout.flat(1);

/* -------------------------------------------------------------------------------------------------
 * Header
 * -----------------------------------------------------------------------------------------------*/

interface HeaderProps {
  name: string;
}

const Header = ({ name }: HeaderProps) => {
  const { formatMessage } = useIntl();
  const modified = useForm('Header', (state) => state.modified);
  const isSubmitting = useForm('Header', (state) => state.isSubmitting);

  return (
    <HeaderLayout
      title={formatMessage(
        {
          id: getTranslation('components.SettingsViewWrapper.pluginHeader.title'),
          defaultMessage: `Configure the view - {name}`,
        },
        { name: capitalise(name) }
      )}
      subtitle={formatMessage({
        id: getTranslation('components.SettingsViewWrapper.pluginHeader.description.edit-settings'),
        defaultMessage: 'Customize how the edit view will look like.',
      })}
      navigationAction={
        // @ts-expect-error – DS does not infer props from the `as` prop
        <Link startIcon={<ArrowLeft />} as={NavLink} to="..">
          {formatMessage({
            id: 'global.back',
            defaultMessage: 'Back',
          })}
        </Link>
      }
      primaryAction={
        <Button disabled={!modified} loading={isSubmitting} type="submit">
          {formatMessage({ id: 'global.save', defaultMessage: 'Save' })}
        </Button>
      }
    />
  );
};

export { ConfigurationForm };
export type { ConfigurationFormProps, ConfigurationFormData };
