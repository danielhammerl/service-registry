import * as yup from 'yup';
import { ServiceRegistryData } from '@danielhammerl/nodejs-service-framework';
import { paramCase } from 'change-case';
import { proxies } from './proxies';
import proxy from 'express-http-proxy';

export const RegisteredServiceShape = yup.object().shape({
  applicationName: yup.string().required(),
  port: yup.number().min(1).max(65536).required(),
});

export const registeredServices = new Map<string, ServiceRegistryData>();

export const addService = async (applicationName: string, port: number) => {
  registeredServices.set(applicationName, { applicationName, port });

  const serverPrefix = `/${paramCase(applicationName)}`;

  await proxies.set(
    applicationName,
    proxy(`http://localhost:${port}`, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(serverPrefix, '');
      },
    })
  );
};
