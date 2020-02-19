## Laravel Mix extension to translate WordPress themes

```js
const mix = require( 'laravel-mix' );
require('laravel-mix-wp-translate');

const themes = ['frc-theme']; //folder name(s)
const languages = ['fi', 'sv_SE']; // language(s)
const options = {
    basePath: '/themes' //path to themes folder from content root path, default is '/themes'
};

// Heroku does not have msgmerge and/or msgfmt available hence..
if ( !mix.inProduction() ) {
    mix
        // creates pot file to `${options.basePath}/themes[]/languages/themes[].pot` 
        // from files in `${options.basePath}/themes[]/**/*.php`
        // options is not required
        // uses wp cli so you should have that
        .pot(themes, options)
        // creates `${options.basePath}/themes[]/languages/${languages[]}.po` files 
        // from `${options.basePath}/themes[]/languages/themes[].pot` file
        // options is not required
        // uses msgmerge so you should have that
        .pot2po(themes, languages, options)
        // creates `${options.basePath}/themes[]/languages/${languages[]}.mo` files 
        // from `${options.basePath}/themes[]/languages/*.po`
        // options is not required
        // uses msgfmt so you should have that
        .po2mo(themes, options);
}
```

PRs welcomed.
