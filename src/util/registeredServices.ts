import * as yup from 'yup';
import _ from 'lodash';
import { log, ServiceRegistryData } from '@danielhammerl/nodejs-service-framework';
import { paramCase } from 'change-case';
import { proxies } from './proxies';
import proxy from 'express-http-proxy';
import { InferType } from 'yup';

type ServiceRegistryDataInternal = ServiceRegistryData & {
  id: string;
};

export const RegisteredServiceShape: yup.ObjectSchema<ServiceRegistryDataInternal> = yup.object().shape({
  applicationName: yup.string().required(),
  port: yup.number().min(1).max(65536).required(),
  id: yup.string().required(),
});

export const RegisteredServicesListShape = yup.lazy((obj) =>
  yup.object(_.mapValues(obj, () => RegisteredServiceShape))
);

export const registeredServices: InferType<typeof RegisteredServicesListShape> = {};

export const addService = (applicationName: string, port: number) => {
  const id = paramCase(applicationName);
  registeredServices[id] = { applicationName, port, id };

  const serverPrefix = `/${id}`;

  proxies.set(
    applicationName,
    proxy(`http://localhost:${port}`, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(serverPrefix, '');
      },
    })
  );
};

export const removeService = (id: string) => {
  try {
    const applicationName = registeredServices[id].applicationName;
    delete registeredServices[id];

    proxies.delete(applicationName);
  } catch (e) {
    log('warning', `Could not remove service ${id}`, e as Error);
  }
};
