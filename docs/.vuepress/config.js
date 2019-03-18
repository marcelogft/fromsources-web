module.exports = {
    title: 'From Sources',
    base: '/fromsources-web/',
    description: "Welcome to the From Sources blog",
    head: [
        ['meta', {name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui'}],
        ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons' }],
        ['link', { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.0.13/css/all.css' }]
    ],
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Blog', link: '/blog/' },
            { text: 'About', link: '/about/' }
        ]
    },
    plugins: ['@vuepress/back-to-top']
}
