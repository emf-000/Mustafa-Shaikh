document.addEventListener('DOMContentLoaded', function () {
    const mapElement = document.getElementById('map');
    const lat = parseFloat(mapElement.getAttribute('data-lat'));
    const lng = parseFloat(mapElement.getAttribute('data-lng'));
    const location = mapElement.getAttribute('data-location');

    const map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup(location) // Just the location string as popup
        .openPopup();
});

