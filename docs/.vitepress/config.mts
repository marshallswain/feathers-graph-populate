import { defineConfig } from 'vitepress'
import { name, description, defaultBranch, repository } from './meta'
import { version } from '../../package.json'

export default defineConfig({
  title: name,
  lastUpdated: true,
  description,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Hooks', link: '/hooks' },
        ],
      },
    ],
    nav: [
      {
        text: `v${version}`,
        items: [
          {
            text: 'Changelog',
            link: `https://github.com/${repository}/blob/${defaultBranch}/CHANGELOG.md`,
          },
          {
            text: 'Contributing',
            link: `https://github.com/${repository}/blob/${defaultBranch}/.github/contributing.md`,
          },
        ],
      },
    ],
    editLink: {
      pattern: `https://github.com/${repository}/edit/${defaultBranch}/docs/:path`,
    },
    socialLinks: [
      {
        icon: 'twitter',
        link: 'https://twitter.com/feathersjs',
      },
      {
        icon: 'discord',
        link: 'https://discord.gg/qa8kez8QBx',
      },
      {
        icon: 'github',
        link: `https://github.com/${repository}`,
      },
    ],
    logo: '/img/graph-populate-logo.png',
    lastUpdatedText: 'Last Updated',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'MIT Licensed | © 2019-present Marshall Thompson',
    },
  },
})
