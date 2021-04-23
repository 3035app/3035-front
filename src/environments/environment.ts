// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  name: 'production',
  production: true,
  version: '1.8.3',
  rollbar_key: '',
  date_format: 'DD MM YY HH:mm:ss',
  api: {
    client_id:     '5zx51xn59n4sowok44gk080800sscs0kgcwg0wg88c4wcss40o',
    client_secret: '2skj6sui9mwwws8gsosgw4g4k04o8gkc8kk8cw8s0s4kksow48',
    host:          'https://inovans.admin.pialab.io',
    token_path:    '/oauth/v2/token'
  }
};
