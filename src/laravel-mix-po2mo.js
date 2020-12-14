const mix = require( 'laravel-mix' );

const sh = require( 'shelljs' );
const path = require( 'path' );
const fs = require( 'fs' );
const glob = require( 'glob' );

const WebpackChokidarPlugin = require( 'webpack-chokidar-plugin' );

class Po2Mo {
    name() {
        return 'po2mo';
    }

    dependencies() {
        this.requiresReload = `
      Dependencies have been installed. Please run again.
    `;

        return [
            'shelljs',
            'path',
            'fs',
            'glob',
            'webpack-chokidar-plugin'
        ];
    }

    register( themes, options = {} ) {

        if ( !sh.which( 'msgfmt' ) ) {
            sh.echo( 'msgfmt not found' );
            sh.exit( 1 );
        }

        let basePath = '/themes';
        if (typeof options.basePath != 'undefined') {
            basePath = options.basePath;
        }
        const themesPath = basePath.replace( /^\/|\/$/g, '' );

        themes = themes.reduce( ( config, theme ) => {
            const name = path.basename( theme );
            const rootPath = process.cwd();
            const langPath = path.join( rootPath, `${themesPath}/${name}/languages/` );

            config.push( {
                langPath,
                po: `${langPath}*.po`
            } );
            return config;
        }, [] );

        this.config = {
            langPaths: themes,
        };

    }

    boot() {
        this.run();
    }

    webpackPlugins() {
        // Example:
        if ( !mix.inProduction() ) {
            return new WebpackChokidarPlugin( {
                watchFilePaths: [
                    this.config.langPaths.map( watch => watch.po )
                ],
                onReadyCallback: () => this.run(),
                onChangeCallback: () => this.run(),
            } );
        }
    }

    run() {
        this.config.langPaths.forEach( theme => {
            glob.sync( '*.po', {
                cwd: theme.langPath,
            } ).forEach( file => {
                file = path.join( theme.langPath, file );
                sh.exec( 'msgfmt -o ' + file.replace( '.po', '.mo' ) + ' ' + file );
                sh.echo( file );
            } );
        } );
    }
}


module.exports = Po2Mo;
