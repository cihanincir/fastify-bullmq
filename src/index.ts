import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { env } from './env';

import { createQueue, setupQueueProcessor } from './queue';

const run = async () => {
  const Service_FlashLiveQueue = createQueue('[SERVICE]FlashLiveRequestQueue');
  const Server_FlashLiveQueue = createQueue('[SERVER]FlashLiveRequestQueue');
  await setupQueueProcessor(FlashLiveQueue.name);

  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
    fastify();

  const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: [new BullMQAdapter(Service_FlashLiveQueue), new BullMQAdapter(Server_FlashLiveQueue)],
    serverAdapter,
  });
  serverAdapter.setBasePath('/');
  server.register(serverAdapter.registerPlugin(), {
    prefix: '/',
    basePath: '/',
  });

  await server.listen({ port: env.PORT, host: '0.0.0.0' });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
