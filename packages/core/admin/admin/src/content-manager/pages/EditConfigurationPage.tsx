import { AnErrorOccurred, CheckPagePermissions, LoadingIndicatorPage } from '@strapi/helper-plugin';

import { useTypedSelector } from '../../core/store/hooks';
import { ConfigurationForm } from '../components/ConfigurationForm/Form';
import { useDocLayout } from '../hooks/useDocumentLayout';

const EditConfigurationPage = () => {
  const { isLoading, error, edit } = useDocLayout();

  if (isLoading) {
    return <LoadingIndicatorPage />;
  }

  if (error) {
    return <AnErrorOccurred />;
  }

  return <ConfigurationForm layout={edit} />;
};

const ProtectedEditConfigurationPage = () => {
  const permissions = useTypedSelector(
    (state) => state.admin_app.permissions.contentManager?.collectionTypesConfigurations
  );

  return (
    <CheckPagePermissions permissions={permissions}>
      <EditConfigurationPage />
    </CheckPagePermissions>
  );
};

export { ProtectedEditConfigurationPage, EditConfigurationPage };
