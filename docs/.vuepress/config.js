module.exports = {
  title: 'feathers-graph-populate',
  description: 'Add lightning fast, GraphQL-like populates to your FeathersJS API.',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  theme: 'default-prefers-color-scheme',
  themeConfig: {
    repo: 'marshallswain/feathers-graph-populate',
    docsDir: 'docs',
    editLinks: true,
    sidebar: ['/getting-started.md', '/graph-populate-hooks.md'],
    serviceWorker: {
      updatePopup: true,
    },
  },
}
