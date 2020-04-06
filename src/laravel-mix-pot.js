const mix = require( 'laravel-mix' );

const sh = require( 'shelljs' );
const path = require( 'path' );
const fs = require( 'fs' );

const WebpackChokidarPlugin = require( 'webpack-chokidar-plugin' );

class Pot {
    name() {
        return 'pot';
    }

    dependencies() {
        this.requiresReload = `
      Dependencies have been installed. Please run again.
    `;

        return [ 'shelljs', 'path', 'fs', 'webpack-chokidar-plugin' ];
    }

    register( themes, options = {} ) {

        let basePath = '/themes';
        if ( typeof options.basePath !== 'undefined' ) {
            basePath = options.basePath;
        }
        const themesPath = basePath.replace( /^\/|\/$/g, '' );
        let cliOptions = '';
        if (typeof options.skipJS !== 'undefined' && options.skipJS) {
          cliOptions = '--skip-js';
        }

        this.config = themes.reduce( ( config, theme) => {
            const name = path.basename( theme );
            const domain = name;
            const rootPath = process.cwd();
            const langPath = path.join( rootPath, `${themesPath}/${name}/languages/` );
            const dest = path.join( langPath, `${domain}.pot` );
            const src = path.join( rootPath, `${themesPath}/${name}` );

            config.push({
                langPath, src, dest, watch: `${src}/**/*.php`, options: cliOptions
            });
            return config;
        }, [] );
    }

    boot() {
        this.run();
    }

    webpackPlugins() {
        // Example:
        if ( !mix.inProduction() ) {
            return new WebpackChokidarPlugin( {
                watchFilePaths: [
                    this.config.map( watch => watch.watch )
                ],
                onReadyCallback: () => this.run(),
                onChangeCallback: () => this.run(),
            } );
        }
    }

    run() {
        this.config.forEach( theme => {
            if ( fs.existsSync( theme.langPath ) ) {
                sh.exec( `wp i18n make-pot ${theme.src} ${theme.dest} ${theme.options}`, { silent: true } );
                sh.exec( `wp i18n make-json ${theme.src} ${theme.dest} ${theme.options}`, { silent: true } );
            }

        } );
    }
}

module.exports = Pot;
