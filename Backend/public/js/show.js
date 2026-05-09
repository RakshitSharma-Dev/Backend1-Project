const dataEl = document.getElementById('listing-data');

const listingId = dataEl.dataset.listingId;
const hasCoords = dataEl.dataset.hasCoords === 'true';
const coords = JSON.parse(dataEl.dataset.coords);
const title = dataEl.dataset.title;
const listingLocation = dataEl.dataset.location;
const country = dataEl.dataset.country;

const socket = io();
socket.emit('joinListing', listingId);
socket.on('viewerCount', (count) => {
    document.getElementById('viewerCount').innerText = count;
});

if (hasCoords) {
    const map = L.map('map').setView([coords[1], coords[0]], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const icon = L.divIcon({
        html: '<i class="fa-solid fa-location-dot" style="color:#fe424d;font-size:1.8rem;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        className: ''
    });

    L.marker([coords[1], coords[0]], { icon })
        .addTo(map)
        .bindPopup(`
            <strong style="font-size:0.9rem;">${title}</strong><br>
            <span style="font-size:0.8rem;color:#555;">${listingLocation}, ${country}</span>
        `)
        .openPopup();
}