'use strict';

// let map;  // to be used in other function
// let mapEvent;// contains coordinates to be used when form submit

class Workout {
  // date where object is created
  date = new Date();
  // Date.now() give mili seconds since 1970
  id = (Date.now() + '').slice(-10); // last 10 numbers

  // to count clicks
  clicks = 0;
  // taking data which is common in both
  constructor(lat, lng, distance, duration) {
    this.coords = [lat, lng]; //[lat,long]
    this.distance = distance;
    this.duration = duration;
    console.log(this.distance);
  }
  _setDescription() {
    // to not go each month on next line
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // new template literal
    // getMonth will give number between 0 and 11
    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(lat, lng, distance, duration, cadance) {
    super(lat, lng, distance, duration);
    this.cadance = cadance;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance; // pace is created
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(lat, lng, distance, duration, elevationGain) {
    super(lat, lng, distance, duration);
    this.elevationGain = elevationGain;
    // function calling in constructor
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // km/hour
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// const run = new Running([39, -12], 52, 24, 178);
// const cycle = new Cycling([39, -12], 52, 24, 523);
// console.log(run, cycle);

//////////////////////////////////////////

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// Refactoring via Architetcural Diagram
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition(); // as we object created it automatically triggered the position
    // DOM is created as page load
    // without bind keyword this._newWorkout as in addEventListener this points to form
    // using bind point to class
    form.addEventListener('submit', this._newWorkOut.bind(this));
    // going to toggle elevation field method
    // change selection
    // in this we not even use bind beacause this will point to input fields
    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click', this._movetoPopup.bind(this));

    // when reload data come
    this._getLocalStorage();
  }
  _getPosition() {
    if (navigator.geolocation) {
      // getting position via load Map function
      //  Geolocation API
      // first when successfully got the coordinates
      // second error callback when error in  getting coordinates
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        // this._getPosition is regular function so this doesn't work
        // so use bind method
        function () {
          alert('Could not get your position ');
        }
      );
    }
  }
  _loadMap(position) {
    //   console.log(position);
    // destructing latitude longitude
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

    const coords = [latitude, longitude];
    /// displaying Map using leaflet  3rd party Library

    // L shows leaflet function  namespace just like intl international namespace
    // map name in html tag
    console.log(this);

    this.#map = L.map('map').setView(coords, 15);
    // console.log(map);
    // open source map
    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // L.marker(coord).addTo(map).bindPopup('leaflet CSS3').openPopup();

    // leaflet library method  on() used as a event listener method
    // handling click on map
    this.#map.on('click', this._showForm.bind(this));
    // code taken to show form function

    // map after load render markup on reload
    this.#workouts.forEach(work => {
      // also add on map
      this._renderWorkOutMarker(work);
      // map is not loaded when you reload
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE; // copying to global variable so used after submit
    form.classList.remove('hidden');
    inputDistance.focus(); // immediately start typing
    //   console.log(mapEvent); // to find latitude and longitude
    //   const { lat, lng } = mapEvent.latlng;
    //  // for marker function set in leaflet
    /// marker where click
    //   L.marker([lat, lng]).addTo(map).bindPopup(L.popup({
    //     maxWidth:250, // documenation all properties explanation
    //     minWidth:100,
    //     autoClose:false,  // to close when we open the next popup
    //     closeOnClick:false, // default true
    //     className:'running-popup',

    //   })).setPopupContent('Workout').openPopup();
  }
  _hideForm() {
    // clear input fields
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none'; // to remove transition that was added in css
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000); //1sec display grid when click again go on grid
  }
  _toggleElevationField() {
    console.log(this);
    // closest parent
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkOut(e) {
    // checking valid inputs
    //... give array every give true if all  are true
    const validinputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    // Display Marker
    // console.log(mapEvent);
    e.preventDefault();

    // get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout; // to store workout of object
    console.log(distance);
    // console.log(duration);
    // console.log(type);

    // If workout running create running object
    if (type === 'running') {
      const cadance = +inputCadence.value;
      // Check if  data is valid inside because we will choose
      // Guard class is using opposite
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadance)
        !validinputs(distance, duration, cadance) ||
        !allPositive(distance, duration, cadance)
      ) {
        return alert('Input has to be positive');
      }
      console.log(distance);
      workout = new Running(lat, lng, distance, duration, cadance);
    }
    // If workout cycling create cyclinng object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Guard class is using opposite
      if (
        //   !Number.isFinite(distance) ||
        //   !Number.isFinite(duration) ||
        //   !Number.isFinite(elevation)
        !validinputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('Input has to be positive');
      }
      workout = new Cycling(lat, lng, distance, duration, elevation);
    }
    // add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    // render workout on map as marker
    this._renderWorkOutMarker(workout, lat, lng);

    // render workout on list
    this._renderWorkout(workout);
    // hide + clear from
    this._hideForm();

    /// setting all the data to local storage
    this._setLocalStorage();
  }
  _renderWorkOutMarker(workout) {
    // for marker function set in leaflet
    //   marker where click
    // console.log(workout);
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250, // documenation all properties explanation
          minWidth: 100,
          autoClose: false, // to close when we open the next popup
          closeOnClick: false, // default true
          className: `${workout.type}-popup`, // workout object calling type variable
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadance}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`;
    }
    if (workout.type === 'cycling') {
      html += ` <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevationGain}</span>
    <span class="workout__unit">m</span>
  </div>
</li>`;
    }
    // as a sibling element of form
    form.insertAdjacentHTML('afterend', html);
  }

  _movetoPopup(e) {
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);

    if (!workoutEl) return;
    // by id we will move to location
    // inworkout array one whole element id check
    // to return the object whose id match
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    // console.log(workout);
    //  console.log(this);
    // in leaflet
    // first coordinates then zoomlevel
    // to move to location
    this.#map.setView(workout.coords, 15, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using public interface
    // workout.click();
  }
  _setLocalStorage() {
    // API  Local Storage
    /// Local Storage is a key value
    // 2nd parameter must be string stored as string but js convert it inoot object
    // to convert to string   smalll data store not big otherwise application slow down
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    // key to retrieve
    // Now convert string to back object
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);

    if (!data) return;

    this.#workouts = data;
    // adding on list
    this.#workouts.forEach(work => {
      this._renderWorkout(work);

      // when restoring data keep in mind that object loose prototypal chain
    });
  }
  // to reset data
  reset() {
    localStorage.removeItem('workouts');
    // location is the big object
    location.reload();
  }
}
/// Object
const app = new App(); // this app is created as app loads

// console.log(firstName);
