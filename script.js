console.log('working !');
const currentsong = new Audio();
let music;
let currfolder;


function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        seconds = 0;
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Ensure seconds are always two digits (e.g., 05 instead of 5)
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    // Return formatted time
    return `${minutes}:${formattedSeconds}`;
}

// for mobile

function handleResize() {
    if (window.innerWidth < 600) {
        document.querySelector(".right").addEventListener("click", () => {
            document.querySelector(".left01").style.display = "none";
            // document.querySelector(".hamcontain").style.zindex = 3
            document.querySelector(".hamcontain").style.display = "flex"
        });
    }
}

function popplay() {

    // play btn for cards !

    const containers = document.querySelectorAll(".cont");
    containers.forEach(container => {
        const playButton = container.querySelector(".playbtnin"); // Find the play button inside this container
        // Set opacity to 1 on hover
        container.addEventListener('mouseover', () => {
            playButton.style.opacity = 1;
        });
        // Set opacity back to 0 when the cursor leaves
        container.addEventListener('mouseout', () => {
            playButton.style.opacity = 0;
        });
    });


}


async function getSongs(folder) {
    currfolder = folder
    try {
        let songs = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
        let response = await songs.text();
        // console.log(response);

        let div = document.createElement("div");
        div.innerHTML = response;

        let as = div.getElementsByTagName("a");
        let songss = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songss.push(element.href.split(`/songs/${folder}/`)[1].replace(".mp3", "").replace("/", ""));
            }
        }


        let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        let listContent = ""; // Initialize an empty string to build the list content
        for (const song of songss) {
            listContent += `<li>
            <div class="musiclogo">♬</div>
            <div class="songname font">${decodeURIComponent(song)}</div>
            <div class="playul">▶</div></li>`;
        }
        songUL.innerHTML = listContent; // Update innerHTML only once with the complete list

        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                console.log(e.getElementsByTagName("div")[1].innerHTML);
                playmusic(e.getElementsByTagName("div")[1].innerHTML.trim());
            })
        })

        return songss;

    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}



const playmusic = (track, pause = false) => {
    currentsong.src = `/songs/${currfolder}/` + track + ".mp3"
    if (!pause) {
        currentsong.play()
        play.innerHTML = "❚❚"
    }
    sinfo.innerHTML = decodeURI(track)
}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/letsee/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/letsee/") && !e.href.includes(".htaccess")) {
            console.log(e.href);
            let folder = e.href.split("/").slice(-1)[0]
            console.log(folder);

            // Get the metadata of the folder
            let a = await fetch(`/songs/letsee/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `
             <div data-folder="letsee/${folder}" class="cont usecard">
           <div class="playbtnin">
                        <span class="invert">▶</span>
                    </div>

            <img class="imgsize2" src="/songs/letsee/${folder}/cover.jpeg" alt="">
            <p class="font">${response.description}</p>
            </div>`
        }
    }
}


async function main() {


    music = await getSongs("music")
    console.log(music);
    playmusic(music[0], true)

    // dynamic cards display
    await displayAlbums()


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.innerHTML = "❚❚"
        }
        else {
            currentsong.pause()
            play.innerHTML = " ▶"
        }
    })

    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            event.preventDefault(); // Prevent page scrolling when spacebar is pressed
            if (currentsong.paused) {
                currentsong.play();
                play.innerHTML = "❚❚";
            } else {
                currentsong.pause();
                play.innerHTML = "▶";
            }
        }
    });

    // Time update
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        songtime.innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`

        document.querySelector(".cir").style.left = ((currentsong.currentTime / currentsong.duration) * 100) + "%"
        document.querySelector(".circlesb").style.width = ((currentsong.currentTime / currentsong.duration) * 100) + "%"
    })


    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".cir").style.left = percent + "%"
        document.querySelector(".circlesb").style.width = percent + "%"
        currentsong.currentTime = ((currentsong.duration * percent) / 100)
    })


    document.querySelector(".hamcontain").addEventListener("click", () => {
        document.querySelector(".left").style.display = "inherit"
        document.querySelector(".left").style.opacity = 1
        document.querySelector(".hamcontain").style.display = "none"

    })

    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // next and prev

    prevs.addEventListener("click", () => {
        console.log('prev');
        let index = music.indexOf(currentsong.src.split("/").slice(-1)[0].replace(".mp3", ""))
        console.log(index);
        // let length = music.length;
        if ((index - 1) >= 0) {
            playmusic(music[index - 1])
        }
        else {
            playmusic(music[music.length - 1])
        }

    });

    nexts.addEventListener("click", () => {
        console.log('next');
        console.log(currentsong);
        let index = music.indexOf(currentsong.src.split("/").slice(-1)[0].replace(".mp3", ""))
        console.log(index);
        if ((index + 1) < music.length) {
            playmusic(music[index + 1])
        }
        else {
            playmusic(music[0])
        }
    });

    // Load the playlist after click
    Array.from(document.getElementsByClassName("usecard")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder);
            music = await getSongs(`${item.currentTarget.dataset.folder}`)
        })

    })

    popplay()

    // go to next song after finish.
    currentsong.addEventListener("ended", () => {
        let index = music.indexOf(currentsong.src.split("/").slice(-1)[0].replace(".mp3", ""))
        console.log(index);
        if ((index + 1) < music.length) {
            playmusic(music[index + 1])
        }
        else {
            playmusic(music[0])
        }
    });

}



main()