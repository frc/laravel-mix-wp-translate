const mix = require( 'laravel-mix' );

const Pot = require( './src/laravel-mix-pot' );
const Pot2Po = require( './src/laravel-mix-pot2po' );
const Po2Mo = require( './src/laravel-mix-po2mo' );

mix.extend( 'pot', new Pot() );
mix.extend( 'pot2po', new Pot2Po() );
mix.extend( 'po2mo', new Po2Mo() );
