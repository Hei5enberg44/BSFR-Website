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

    const map = L.map('map').setView([47, 2], 5.75)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map)

    const popups = []
    for(const city of cities) {
        const memberId = city.memberId
        const member = members.find(m => m.user.id === memberId)
        const username = member.user.username
        const avatarURL = member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : `https://cdn.discordapp.com/embed/avatars/${parseInt(member.user.discriminator) % 5}.png`

        const coords = city.coordonnees_gps
        const postalCode = city.code_postal.toString().padStart(5, '0')
        const cityName = city.nom_de_la_commune

        const p = popups.find(p => p.coords === coords && p.postalCode === postalCode && p.cityName === cityName)

        if(!p) {
            popups.push({
                coords: coords,
                postalCode: postalCode,
                cityName: cityName,
                users: [
                    {
                        username: username,
                        avatar: avatarURL
                    }
                ]
            })
        } else {
            p.users.push({
                username: username,
                avatar: avatarURL
            })
        }
    }

    for(const p of popups) {
        const coords = p.coords.split(',')
        const marker = L.marker(coords).addTo(map)

        const popupUsers = []
        for(const u of p.users) {
            popupUsers.push(`<table><tbody><tr><td><span class="avatar avatar-rounded me-2" style="background-image: url(${u.avatar})"></span></td><td><b>${u.username}</b><br>${p.postalCode} ${p.cityName}</td></tr></tbody></table>`)
        }
        marker.bindPopup(popupUsers.join('<hr style="border:none">'))
    }
}