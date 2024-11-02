let currentsong = new Audio();
let songs
let currfolder
function secondstominutes(seconds){
    if(isNaN(seconds)||seconds<0){
        return "Invalid input";
    }
    const minutes = Math.floor(seconds/60);
    const remainingSeconds = Math.floor(seconds%60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSinutes = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSinutes}`

}
async function getsongs(folder){
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    //console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as=div.getElementsByTagName("a");
    //console.log(as);
    let songs = [];
    for(let index=0 ;index < as.length; index++){
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}/`)[1]);
        }

    }
    // show all the event listener in a playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs){
        songul.innerHTML = songul.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img class="invert" src="img/playn.svg" alt="">
        </div>
    </li>`;
    }
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}
const playmusic = (track, pause=false)=>{
    currentsong.src= `${currfolder}/` + track
    if(!pause){

        currentsong.play()
        play.src="img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    
}
async function displayalbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++){
        const e = array[index];
        if(e.href.includes("/songs/")){
            let cardcontainer = document.querySelector(".cardcontainer")
           let folder = (e.href.split("/").slice(-1)[0]);
           // get the metadata of the folder
           let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
           let response = await a.json()
           console.log(response.title)
           cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
           <img src="/songs/${folder}/cover.jpeg" alt="">
           <h2>${response.title}</h2>
           <p>${response.description}</p>
       </div>`



        }
    } 
    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            console.log(item.currentTarget.dataset.folder)
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0]);
        })
    })   
}
async function main(){
    songs = await getsongs("songs/cs");
    playmusic(songs[0], true);

    // Display all the albums on the page
    displayalbums()
    
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play();
            play.src="img/pause.svg"
        }
        else{
            currentsong.pause()
            play.src="img/play.svg"
        }
    })
    currentsong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondstominutes(currentsong.currentTime)}/${secondstominutes(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100+"%";
    })
    // add an event listner to seek bar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = (currentsong.duration*percent)/100;
        
    })
    // add event listner to humburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = 0;
    })
    // add event listner to close
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = -100 + "%";
    })
    // add an event listener to previous and next
    previous.addEventListener("click", ()=>{
        currentsong.pause()
        play.src="img/play.svg"
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playmusic(songs[index-1])
        }
    })
    next.addEventListener("click", ()=>{
        currentsong.pause()
        play.src="img/play.svg"
        console.log("Next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){
            playmusic(songs[index+1])
        }
    })
    





}
main()