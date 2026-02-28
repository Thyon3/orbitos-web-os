import App from './App';

export default class MusicApp extends App {
    constructor() {
        super({
            id: 'music',
            name: 'Music Player',
            icon: '🎵',
            component: 'music'
        });
    }
}
