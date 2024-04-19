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

    L.esri.Vector.vectorBasemapLayer("arcgis/navigation", {
        apikey: 'AAPKbd80a71eb7694e0cad9f29fea06b27b7YKFdaFPfA5lECHP8_qvqG5b0eyJW4TbpP5ndaM1QvNkj1Oya5z9Oxx5ShArwhraE',
        language: 'fr'
    }).addTo(map)

    const popups = []
    for(const city of cities) {
        const memberId = city.memberId
        const member = members.find(m => m.user.id === memberId)
        const username = member.user.username
        const avatarURL = member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : `https://cdn.discordapp.com/embed/avatars/${parseInt(member.user.discriminator) % 5}.png`

        const coords = city.coordonnees_gps
        const countryName = city.pays
        const cityName = city.commune

        const p = popups.find(p => p.countryName === countryName && p.cityName === cityName && p.coords === coords)

        if(!p) {
            popups.push({
                coords: coords,
                countryName: countryName,
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
            popupUsers.push(`<table><tbody><tr><td><span class="avatar avatar-rounded me-2" style="background-image: url(${u.avatar})"></span></td><td><b>${u.username}</b><br>${p.cityName} (${p.countryName})</td></tr></tbody></table>`)
        }
        marker.bindPopup(popupUsers.join('<hr class="my-2">'))
    }
}