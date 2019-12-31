module.exports = {
  title: 'feathers-deep-populate',
  description: 'The fast way to populate FeathersJS data with a GraphQL-esque query',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  theme: 'default-prefers-color-scheme',
  themeConfig: {
    repo: 'feathersjs-ecosystem/feathers-vuex',
    docsDir: 'docs',
    editLinks: true,
    sidebar: [
      '/api-overview.md',
      '/getting-started.md'
    ],
    serviceWorker: {
      updatePopup: true
    }
  }
}
