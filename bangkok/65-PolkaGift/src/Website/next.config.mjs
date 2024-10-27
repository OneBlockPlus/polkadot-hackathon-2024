const path =await import('path')
const sass = await import('sass')
 export default {
  reactStrictMode: true,
 
  sassOptions: {
    includePaths: [path.join('./', 'styles')],
    includePaths: [path.join('./', 'pages')],
    includePaths: [path.join('./', 'components')],
    silenceDeprecations: ['legacy-js-api'],
  },
}