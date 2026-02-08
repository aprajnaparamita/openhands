import { createApp } from './server';

const server = createApp().listen();
console.log(`Server started on port ${process.env.PORT || 3000}`);

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log(`Received ${signal}, closing server...`);
    server?.close(() => {
      console.log('HTTP server closed gracefully');
      process.exit(0);
    });
  });
});
