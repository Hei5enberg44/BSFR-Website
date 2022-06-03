window.onload = async function() {
    const citiesRequest = await fetch('/cities', {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    const cities = await citiesRequest.json()

    const membersRequest = await fetch('/guildMembers', {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    const members = await membersRequest.json()

    let map = L.map('map').setView([47, 2], 5.75)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map)

    for(const city of cities) {
        const coords = city.coordonnees_gps.split(',')
        const memberId = city.memberId
        const member = members.find(m => m.user.id === memberId)
        const avatarURL = `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80`

        const marker = L.marker(coords).addTo(map)
        marker.bindPopup(`<img src="${avatarURL}" class="discord-avatar"><div style="display:inline-block;vertical-align:middle;"><b>${member.user.username}</b><br>${city.code_postal} ${city.nom_de_la_commune}</div>`)
    }
}