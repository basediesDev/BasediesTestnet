/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/collection',
        destination: '/',
        permanent: true,
      },
    ]
  },
}