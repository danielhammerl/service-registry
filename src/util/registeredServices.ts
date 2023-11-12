import * as yup from 'yup';
import _ from 'lodash';
import { ServiceRegistryData } from '@danielhammerl/nodejs-service-framework';
import { paramCase } from 'change-case';
import { proxies } from './proxies';
import proxy from 'express-http-proxy';
import { InferType } from 'yup';

export const RegisteredServiceShape: yup.ObjectSchema<ServiceRegistryData> = yup.object().shape({
  applicationName: yup.string().required(),
  port: yup.number().min(1).max(65536).required(),
});

export const RegisteredServicesListShape = yup.lazy((obj) =>
  yup.object(_.mapValues(obj, () => RegisteredServiceShape))
);

export const registeredServices: InferType<typeof RegisteredServicesListShape> = {};

export const addService = (applicationName: string, port: number) => {
  registeredServices[applicationName] = { applicationName, port };

  const serverPrefix = `/${paramCase(applicationName)}`;

  proxies.set(
    applicationName,
    proxy(`http://localhost:${port}`, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(serverPrefix, '');
      },
    })
  );
};
