const mix = require( 'laravel-mix' );

const sh = require( 'shelljs' );
const path = require( 'path' );
const fs = require( 'fs' );
const glob = require( 'glob' );

const WebpackChokidarPlugin = require( 'webpack-chokidar-plugin' );

class Pot2Po {
    name() {
        return 'pot2po';
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

    register( themes, languages, options = {} ) {

        if ( !sh.which( 'msgmerge' ) ) {
            sh.echo( 'msgmerge not found' );
            sh.exit( 1 );
        }

        let basePath = '/themes';
        if ( typeof options.basePath != 'undefined' ) {
            basePath = options.basePath;
        }
        const themesPath = basePath.replace( /^\/|\/$/g, '' );

        themes = themes.reduce( ( config, theme ) => {
            const name = path.basename( theme );
            const domain = name;
            const rootPath = process.cwd();
            const langPath = path.join( rootPath, `${themesPath}/${name}/languages/` );
            const pot = path.join( langPath, `${domain}.pot` );
            const src = path.join( rootPath, `${themesPath}/${name}` );

            config.push( {
                langPath,
                src,
                pot
            } );
            return config;
        }, [] );


        this.config = {
            themes: themes ? themes : [],
            languages: languages ? languages : []
        }
    }

    boot() {
        this.run();
    }

    webpackPlugins() {
        // Example:
        if ( !mix.inProduction() ) {
            return new WebpackChokidarPlugin( {
                watchFilePaths: [
                    this.config.themes.map( watch => watch.pot )
                ],
                onReadyCallback: () => this.run(),
                onChangeCallback: () => this.run(),
            } );
        }
    }

    run() {



        this.config.themes.forEach( theme => {

            this.config.languages.forEach( lang => {
                const langfile = path.join( theme.langPath, `${lang}.po` );
                if ( !fs.existsSync( langfile ) ) {
                    fs.writeFile( langfile, '', function ( err ) {
                        if ( err ) throw err;
                        console.log( `${lang}.po File is created successfully.` );
                    } );
                }
            } );

            glob.sync( '*.po', {
                cwd: theme.langPath,
            } ).forEach( file => {
                file = path.join( theme.langPath, file );
                sh.exec( 'msgmerge --update --backup=none --no-fuzzy-matching ' + file + ' ' + theme.pot );
                sh.echo( file );
            } );

        } );
    }
}

module.exports = Pot2Po;
