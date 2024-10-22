import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Cybros Network",
  description: "The Wiki site for Cybros Network",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick start', link: '/quick-start' }
    ],

    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Quick start', link: '/quick-start' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cybros-network/cybros-network' }
    ]
  }
})
