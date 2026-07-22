/**
 * scripts/testOSRM.js
 *
 * Test script to verify OSRM public routing API.
 */

const https = require('https');

const CITY_COORDINATES = {
    'raipur': [81.6296, 21.2514],
    'bilaspur': [82.1409, 22.0797],
};

const getRecommendedRouteDetails = (originCity, destCity) => {
    return new Promise((resolve, reject) => {
        const originCoords = CITY_COORDINATES[originCity];
        const destCoords = CITY_COORDINATES[destCity];
        
        if (!originCoords || !destCoords) {
            return reject(new Error('City coordinates not found'));
        }
        
        const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false`;
        
        console.log(`Fetching OSRM route: ${url}`);
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json && json.routes && json.routes.length > 0) {
                        const route = json.routes[0];
                        resolve({
                            distanceKm: Math.round(route.distance / 1000), // meters to km
                            durationMinutes: Math.round(route.duration / 60) // seconds to minutes
                        });
                    } else {
                        reject(new Error('No route found in response'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

// Run calculation
getRecommendedRouteDetails('raipur', 'bilaspur')
    .then((result) => {
        console.log('OSRM Routing succeeded!');
        console.log(`Raipur -> Bilaspur Recommended Route Details:`);
        console.log(`Distance: ${result.distanceKm} km`);
        console.log(`Duration: ${result.durationMinutes} mins (${Math.round(result.durationMinutes / 60)} hrs)`);
        process.exit(0);
    })
    .catch((err) => {
        console.error('OSRM Routing failed:', err);
        process.exit(1);
    });
