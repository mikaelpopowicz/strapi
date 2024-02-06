import * as React from 'react';

import {
  CheckPagePermissions,
  LoadingIndicatorPage,
  useAPIErrorHandler,
  useNotification,
} from '@strapi/helper-plugin';
import { useParams } from 'react-router-dom';

import { useTypedSelector } from '../../core/store/hooks';
import { selectSchemas } from '../layout';
import { useGetComponentConfigurationQuery } from '../services/components';
import { mergeMetasWithSchema } from '../utils/schemas';

// import { SettingsForm } from './EditSettingsView/components/SettingsForm/SettingsForm';

const ComponentConfigurationPage = () => {
  const schemas = useTypedSelector(selectSchemas);
  const permissions = useTypedSelector((state) => state.admin_app.permissions);
  const { uid } = useParams<{ uid: string }>();
  const { _unstableFormatAPIError: formatAPIError } = useAPIErrorHandler();
  const toggleNotification = useNotification();

  const { data, isLoading, error } = useGetComponentConfigurationQuery(uid!, {
    skip: !uid,
  });

  React.useEffect(() => {
    if (error) {
      toggleNotification({
        type: 'warning',
        message: formatAPIError(error),
      });
    }
  }, [error, formatAPIError, toggleNotification]);

  const layout = React.useMemo(
    () => (data ? mergeMetasWithSchema(data, schemas, 'component') : null),
    [data, schemas]
  );

  if (isLoading || !layout) {
    return <LoadingIndicatorPage />;
  }

  return null;

  // return (
  //   <CheckPagePermissions permissions={permissions.contentManager?.componentsConfigurations}>
  //     <SettingsForm components={layout.components} layout={layout.component} />
  //   </CheckPagePermissions>
  // );
};

const ProtectedComponentConfigurationPage = () => {
  const permissions = useTypedSelector(
    (state) => state.admin_app.permissions.contentManager?.componentsConfigurations
  );

  return (
    <CheckPagePermissions permissions={permissions}>
      <ComponentConfigurationPage />
    </CheckPagePermissions>
  );
};

export { ComponentConfigurationPage, ProtectedComponentConfigurationPage };
