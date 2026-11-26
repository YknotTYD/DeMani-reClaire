export default {
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'unsavable-delcie-ungrudgingly.ngrok-free.dev',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, '')
      }
    }
  }
}
