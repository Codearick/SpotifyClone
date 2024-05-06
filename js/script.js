let currentSong = new Audio();
let songs;
let currentFolder;
function formatTime(seconds) {
    if (isNaN((seconds) || seconds < 0)) {
        return " ";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`/${currentFolder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currentFolder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
        <div class="songlistinfo">
           <div>${song.replaceAll("%20", " ")}</div>
           <div>Arijit Singh</div>
        </div>
        <div class="playnow">
           <img class="invert" src="img/play.svg" alt="">
        </div>
        </li>`;
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".songlistinfo :nth-child(1)").innerHTML.trim());
        })
    });
    return songs;
}

const playMusic = async (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        await currentSong.play();
        pause.src = pause.svg;
        document.querySelector(".songinfo :nth-child(1)").innerHTML = decodeURI(track).replace(".mp3", " ");
        document.querySelector(".songinfo :nth-child(2)").innerHTML = "Arijit Singh";
    }
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json().catch(()=>({}));
            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M3 22v-20l18 10-18 10z" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h3>${response.heading}</h3>
            <p>${response.description}</p>
        </div>`;
        }
    }
    //Loding playlist when card(album) is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

async function main() {
    //Get the list of songs
    await getSongs("songs/loved");
    const randomIndex = Math.floor(Math.random() * songs.length);
    playMusic(songs[randomIndex], true);

    //Display all the albums on the page
    await displayAlbums();
    //Attach an event listener to play,next and previous.
    pause.addEventListener('click', async () => {
        try {
            if (currentSong.paused) {
                currentSong.play();
                pause.src = "img/pause.svg"; // Change the icon to represent play
            } else {
                currentSong.pause();
                pause.src = "img/play.svg"; // Change the icon to represent play
            }
        } catch (error) {
            console.error("Error during playback:", error.message);
        }
    });

    //Listen for timeupdate event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector(".currenttime").innerHTML = `${formatTime(currentSong.currentTime)}`;
        document.querySelector(".songduration").innerHTML = `${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    })

    //Adding event listeer to the next and previous
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
        else {
            playMusic(songs[0]);
        }
    });
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
        else {
            playMusic(songs[songs.length - 1]);
        }
    });

    //Adding event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })

    //Adding event listener for volume range
    volumerange.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //Adding event listener to track
    volumeimg.addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            volumerange.value = 0;
            currentSong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            volumerange.value = 10;
            currentSong.volume = .10;
        }
    })
};
main();
