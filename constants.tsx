
import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'basic_plus',
    name: 'COTRAC BASIC+',
    description: 'Real-time 24/7 tracking, ignition status, geo-fencing, and power cut alerts.',
    icon: 'fa-location-crosshairs'
  },
  {
    id: 'gold',
    name: 'COTRAC GOLD',
    description: 'Includes Basic+ features plus Remote Immobilization (Engine Stop), SOS alert, and Voice monitoring.',
    icon: 'fa-shield-halved'
  },
  {
    id: 'enterprise',
    name: 'COTRAC ENTERPRISE',
    description: 'Comprehensive fleet oversight: Includes Gold features plus precision fuel level monitoring, fuel theft alerts, and consumption reports.',
    icon: 'fa-gas-pump'
  }
];
