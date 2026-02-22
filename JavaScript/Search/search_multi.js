// Lista centralizzata dei giochi MULTIPLAYER
const games = [
  {name:"BodyRecords", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3232040/header.jpg?t=1755610393", link:"BodyRecords.html"},
  {name:"Lethal Company", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/header.jpg?t=1762544438", link:"Lethal Company.html"},
  {name:"Macabre", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1794830/e489bdd0bd3c80ccf17ab6cc01be5290f4e8c8ac/header.jpg?t=1764541459", link:"Macabre.html"},
  {name:"Ready or Not", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1144200/header.jpg?t=1753984272", link:"ReadyOrNot.html"},
  {name:"BodyCam", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2406770/bb577b428ed83ff9e3aa1c64844d1561814dffca/header.jpg?t=1764891119", link:"BodyCam.html"},
  {name:"MIMESIS", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2827200/8a2a6edc97fbf23ea6941974bdf4ed9a6ab34eb4/header.jpg?t=1764658096", link:"MIMESIS.html"},
  {name:"Emissary Zero", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3176060/24364d74d56334dcb9b93031603a4ba107ecf0d7/header.jpg?t=1761402119", link:"EmissaryZero.html"},
  {name:"Silent Breath", img:"silentbreath.png", link:"SilentBreath.html"},
  {name:"SIDE EFFECTS", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3799100/ab45f12575f1e05377a5982eebd5bad800712ca2/header.jpg?t=1763737405", link:"SideEffects.html"},
  {name:"CRYO", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2564910/header.jpg?t=1761331796", link:"Cryo.html"},
  {name:"The Other Side", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2764750/ac1e5a495cb576601f98993c16010d74db819157/header.jpg?t=1762298167", link:"TheOtherSide.html"},
  {name:"Panicore", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2695940/ae7913a03788c22d396b39f99cdea71d017a469d/header.jpg?t=1760284560", link:"Panicore.html"},
  {name:"Content Warning", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2881650/header.jpg?t=1736717925", link:"ContentWarning.html"},
  {name:"Peak", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3527290/bd3771d9a3827610b2742de13d8552918008c302/header_alt_assets_2.jpg?t=1762370967", link:"Peak.html"},
  {name:"Friday the 13th", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/438740/header.jpg?t=1704032773", link:"FridayThe13th.html"},
  {name:"MISERY", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2119830/f4aa2f3b4b352f7f373026fe592d32eef2c72fce/header.jpg?t=1763600148", link:"MISERY.html"},
  {name:"REPO", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3241660/1ea445e044a2d5b09cfa8291350b63ebed6e5741/header.jpg?t=1761906910", link:"REPO.html"},
  {name:"RV There Yet?", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3949040/cae24b4ed7f4531be51f0d63f785b7d253f92dc3/header.jpg?t=1761681404", link:"RVThereYet.html"},
  {name:"Pizza Deathlivery", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3697560/09596d1d2c3a6967e1ef9599739b76ff489ffedb/header.jpg?t=1763386816", link:"PizzaDeathlivery.html"},
  {name:"Look Your Door", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3004140/7fedf7839796819de0ea6923b2371b28901275e6/header.jpg?t=1763936939", link:"LookYourDoor.html"},
  {name:"Granny Escape Together", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3070520/header.jpg?t=1762796057", link:"GrannyEscapeTogether.html"},
  {name:"Backroom Company", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3010460/ce664e54209f580622072902add7e525ab24b121/header.jpg?t=1753862334", link:"BackroomCompany.html"},
  {name:"Climb The Backrooms", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3575300/125a1516b16ce033aa6ed0bf1116c64c7883df9d/header.jpg?t=1753178014", link:"ClimbTheBackrooms.html"},
  {name:"Cursed Companions", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3265230/header.jpg?t=1764341388", link:"CursedCompanions.html"},
  {name:"Deadly Quiet", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3419130/header.jpg?t=1749380596", link:"DeadlyQuiet.html"},
  {name:"Explosive Odds", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3674980/269e953c770b781803997e4da74ca53f190fa031/header.jpg?t=1764703673", link:"Explosive Odds.html"},
  {name:"Keep Digging", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3585800/9b2548eda14759f6a4aa1d861ca100c7c437bbe8/header.jpg?t=1757581771", link:"KeepDigging.html"},
  {name:"Try To Drive", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3621700/defa537fea0d08c31eab9d1828875b8a42fc1430/header.jpg?t=1763746736", link:"TryToDrive.html"},
  {name:"Exit Together", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3333740/header.jpg?t=1764625982", link:"ExitTogether.html"},
  {name:"Mage Arena", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3716600/e09e178465c67642c1214736e29d64846d966e52/header.jpg?t=1754585254", link:"MageArena.html"},
  {name:"Frog Jump", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3448750/3f741a66ae98d8185f0bb7adaed6e1f9539a83f5/header.jpg?t=1762810909", link:"FrogJump.html"},
  {name:"USAC: Code Breach", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1886070/header.jpg?t=1729186951", link:"USACCode.html"},
  {name:"Crime Simulator", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2737070/header.jpg?t=1764671705", link:"CrimeSimulator.html"},
  {name:"CUFFBUST", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2592220/header.jpg?t=1760535283", link:"CUFFBUST.html"},
  {name:"Long Drive North", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3179350/header.jpg?t=1763573191", link:"LongDrive.html"},
  {name:"Stuck Together", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3295360/8cfb2382805e292efa2b52a0e69eb4f5fdb2bec1/header.jpg?t=1763744604", link:"StuckTogether.html"},
  {name:"TheYouQuiz", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3669740/bd812c1522d0c3e5dbbec5de41f6398ae1ea2c50/header.jpg?t=1765088431", link:"TheYouQuiz.html"},
  {name:"Pacify", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/967050/header.jpg?t=1737656285", link:"Pacify.html"},
  {name:"Store Bound", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3417410/eb7fea055df13a7de82827171182d1ced34b7888/header.jpg?t=1766064713", link:"StoreBound.html"},
  {name:"We Escaped a Twisted Game", img:"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2524930/header.jpg?t=1768072617", link:"WeEscapedaTwistedGame.html"},
  {name:"Road Food Simulator", img:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3207670/header.jpg?t=1755185710", link:"RoadFoodSimulator.html"}
];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Stile CSS iniettato (Fixed 4 slots, no scrollbar, matching ACROX theme)
    const style = document.createElement('style');
    style.innerHTML = `
        #search-results {
            overflow: hidden !important;
            scrollbar-width: none;
            background: #1e1e1e;
            border: 1px solid #9b59b6;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6);
        }
        #search-results::-webkit-scrollbar { display: none; }
        #search-results div {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            cursor: pointer;
            transition: 0.2s;
        }
        #search-results div:hover { background: rgba(155, 89, 182, 0.2); }
        #search-results img { 
            width: 35px !important; 
            height: 35px !important; 
            min-width: 35px;
            object-fit: cover; 
            border-radius: 4px; 
            margin-right: 12px; 
        }
        #search-results span {
            font-size: 14px;
            color: #eee;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(style);

    searchInput.addEventListener('input', () => {
        const val = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        if (val === '') { 
            searchResults.style.display = 'none'; 
            return; 
        }

        // LOGICA CORRETTA: Filtra solo i nomi che INIZIANO con il valore digitato
        const filtered = games.filter(g => g.name.toLowerCase().startsWith(val)).slice(0, 4);

        filtered.forEach(g => {
            const div = document.createElement('div');
            div.innerHTML = `<img src="${g.img}" alt="${g.name}"><span>${g.name}</span>`;
            div.addEventListener('click', () => { 
                window.location.href = g.link; 
            });
            searchResults.appendChild(div);
        });

        searchResults.style.display = filtered.length ? 'block' : 'none';
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            searchResults.style.display = 'none';
        }
    });
});