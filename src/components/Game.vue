<template>
  <div>
   
    <br>
    <div>
    <gmap-map 
    id="map"
      :center="center"
      :zoom="13"
      :options="mapOptions"
      @click="getResult"
      style="width:40%;  height: 400px; margin-left:100px; float:left; "
      
    >
      <gmap-marker
        :key="index"
        v-for="(m, index) in markers"
        :position="m.position"
        @click="center=m.position"
      ></gmap-marker>
    </gmap-map>

    <img v-bind:src="this.pictures[this.cpt].url" style="width:40%; height:400px; margin-left:120px;"></div>
    <br> <br><div> Distance :{{distance}} </div>
    <div> <h1><p>Votre score est :{{score}}  </p></h1></div>
    <button @click="goToNext">Suivant</button>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: "GoogleMap",
  data() {
    return {
      // default to Montreal to keep it simple
      // change this to whatever makes sense
      pictures:'',
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      places: [],
      currentPlace: null,
      mapOptions: {
      controlSize: 20,
      clickableIcons: false,
      draggable: true,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }]
        }
      ]
    },
    ltPicture:'',
    lgPicture:'',
    distance:0,
    cpt:0,
    isSaving: false,
    showPause: true,
    showNext: false,
    startTime: Date.now(),
    score: 0,
    scoreProvisoire:0,
    pauseTime: null,
    timePaused: 0,
    focuses: [],
    isPaused: true,
    timer: '',
    seconds: 25 * 60
    };
  },

  mounted() {
   this.getGame()
   
    
   
  },

  methods: {
    
    getGame(){

        axios.get("games/"+this.$store.state.game.id+"/photos?token="+this.$store.state.game.token).then(response => {
        this.$store.commit("setPhotos", response.data.result);
        this.pictures=response.data.result;
        console.log(response.data.result)
        this.geoPicture()
      }).catch(error => console.log(error));

    },
    setPlace(place) {
      this.currentPlace = place;
    },
    goToNext(){
      
      if(this.cpt < this.pictures.length-1)
      {
      this.cpt=this.cpt+1
      this.markers=[]
      this.geoPicture()
      }else{
        this.$store.state.timeGame=this.timer
        this.$store.state.score=this.score
         this.$router.push("/result");
      }
    },
    geoPicture(){
        let str = this.pictures[this.cpt].position.replace(/\[/g,"")
         str=str.replace(/\]/g,"") 
        
         let t =str.split(',')
         this.ltPicture = parseFloat(t[1])
        this.lgPicture =  parseFloat(t[0])
         const marker = {
            lat: this.ltPicture ,
            lng: this.lgPicture
          };
          this.center = marker;
          this.currentPlace = null;

    },
    loadMap() {
       
        this.center = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng()
          
        };
      
    },
    geolocate: function() {
      navigator.geolocation.getCurrentPosition(position => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
    },
    
    async getResult(cursorPos) {
        const marker={
            lat: cursorPos.latLng.lat(),
          lng:cursorPos.latLng.lng()
        };
        this.markers.push({ position: marker});
        this.places.push(this.currentPlace);
        this.currentPlace = null;
        this.getDistance(marker);
        this.stopTimer();
        this.calculScore();
        
        
     /* alert(cursorPos.latLng.lat()+" et"+cursorPos.latLng.lng());*/
    },
    getDistance(p1) {
      const rad = function(x) {
        return (x * Math.PI) / 180;
      };
      /*alert(this.lgPicture);*/
      const R = 6378137; // Earth’s mean radius in meter
      const dLat = rad(this.ltPicture - p1.lat);
      const dLong = rad(this.lgPicture - p1.lng);
      
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) *
          Math.cos(rad(this.ltPicture)) *
          Math.sin(dLong / 2) *
          Math.sin(dLong / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    this.distance= Math.round(R * c); // returns the distance in meter
    const marker={
            lat: this.ltPicture,
          lng:this.lgPicture
        };
        this.markers.push({ position: marker,icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
    } });
        this.places.push(this.currentPlace);
        this.center = marker;
        this.currentPlace = null;
    
    },
    calculScore() {
       var d = this.$store.state.difgame.distance
       
      if (this.distance < d) {
        this.scoreProvisoire += 5;
      } else if (this.distance < 2 * d) {
         this.scoreProvisoire += 3;
      } else if (this.distance < 3 * d) {
         this.scoreProvisoire += 1;
      }

      const timePlayed = this.seconds - this.timePaused;
      this.$store.state.timeGame +=timePlayed
      

      if (timePlayed < 15) {
         this.scoreProvisoire *= 4;
      } else if (timePlayed >= 15 && timePlayed < 30) {
         this.scoreProvisoire *= 2;
      } else if (timePlayed >= 30 && timePlayed < 60) {
        this.scoreProvisoire *= 1;
      } else if (timePlayed > 60) {
         this.scoreProvisoire = 0;
      }
    this.score += this.scoreProvisoire
    this.scoreProvisoire=0
     
    },
    stopTimer() {
      let millis = Date.now() - this.startTime;
      this.seconds = Math.floor(millis / 1000);
      //alert(this.seconds)
      this.startTime=Date.now();
    },
    stopPause() {
      let millis = Date.now() - this.pauseTime;
      this.timePaused = Math.floor(millis / 1000);
      this.pauseTime = null;
      this.isPaused = !this.isPaused;
    },
    pauseGame() {
      this.pauseTime = Date.now();
      this.isPaused = !this.isPaused;
    }

  }
};
</script>