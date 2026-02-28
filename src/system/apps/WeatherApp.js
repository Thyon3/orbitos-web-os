import App from './App';

export default class WeatherApp extends App {
    constructor() {
        super({
            id: 'weather',
            name: 'Weather',
            icon: '🌤️',
            component: 'weather'
        });
    }
}
