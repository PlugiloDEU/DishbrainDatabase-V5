// These should be loaded from environment variables in production
export const PROXY_LIST = [
  {
    host: 'proxy1.example.com',
    port: '8080',
    auth: 'username:password' // if required
  },
  {
    host: 'proxy2.example.com',
    port: '8080',
    auth: 'username:password'
  },
  // Add more proxies...
];

export const PROXY_CONFIG = {
  rotationInterval: 1000, // Time in ms between proxy rotations
  maxRetries: 3,
  timeout: 10000, // Request timeout in ms
}; 