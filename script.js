const apiKey = "91de757c932cc9e328ddabc86b799760";
const gpsButton = document.querySelector(".gps-container img");
const cityName = document.querySelector("input")
const getWeatherButton = document.querySelector(".check-weather");

window.addEventListener("load", () => {
  sendDataToWeather("Warsaw")
})

cityName.addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    sendDataToWeather(cityName.value);
  }
})

const getCurrentTime = () => {
  const time = new Date();
  let hours = time.getHours();
  let minutes = time.getMinutes();
  let weekDay = time.getDay();
  let days = time.getDate();
  let month = time.getMonth()
  let year = time.getFullYear();

  return {time, year, month, days, weekDay, minutes, hours}
}

const fromUnixConverter = (UNIX_timestamp) => {
  let a = new Date(UNIX_timestamp * 1000);
  let year = a.getFullYear();
  let month = a.getMonth()
  let day = a.getDate();
  let hour = a.getHours();
  let min = a.getMinutes();
  let date = `${year}-${month}-${day}`
  return date;
}

const getMainDate = () => {
    getCurrentTime();
    let {year, month, weekDay} = getCurrentTime();

    const months = ["January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"];
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const monthYear = document.querySelector(".month-year");
    const week = document.querySelector(".week-day");

    monthYear.textContent = `${months[month]} ${year}`;
    week.textContent = `${weekDays[weekDay]}`;
}
getMainDate();

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, error);
  }
}

const showPosition = (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  getCity(latitude, longitude);
}

const error = () => {
  console.log("error!")
}

async function sendDataToWeather(city) {
  const promise = await fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
  const processedPromise = await promise.json();

  getWeather(processedPromise);
}

getWeatherButton.addEventListener("click", () => {
  sendDataToWeather(cityName.value);
})
gpsButton.addEventListener("click", getLocation)

const getCity = (latitude, longitude) => {
  fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
  .then(res => res.json())
  .then(data => getWeather(data))
};

const getWeather = (weatherDetails) => {
  const {temp, feels_like, humidity, pressure} = weatherDetails.list[0].main;
  const {speed, deg} = weatherDetails.list[0].wind
  const {description, icon} = weatherDetails.list[0].weather[0];
  const {country, name} = weatherDetails.city;

  document.querySelector(".main-temp-content h2").textContent = `${name}, ${country}`
  document.querySelector(".temp").textContent = `${Math.round(temp)}°`
  document.querySelector(".feeling-temp").textContent = `Feels like: ${feels_like.toFixed(0)}°`
  document.querySelector(".main-weather-icon").src = `http://openweathermap.org/img/wn/${icon}.png`
  document.querySelector(".description").textContent = description;
  document.querySelector(".humidity p").textContent = `${humidity}%`;
  document.querySelector(".pressure p").textContent = `${pressure}hPa`;
  document.querySelector(".wind-speed p").textContent = `${speed}km/h`;
  document.querySelector(".wind-direction p").textContent = `${deg}°`

  // forecast 3 days
  const weekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const forecast = document.querySelectorAll(".date");
  const allTemps = document.querySelectorAll(".temp-day");
  const allIcons = document.querySelectorAll(".weather-icon");
  const actualDates = [];
  const weatherList = weatherDetails.list;
  // time
  getCurrentTime();
  let {year, month, days} = getCurrentTime();
  month = month + 1;

  const toUnixTimestamp = (date) => {
    const unix = parseInt((new Date(date).getTime() / 1000).toFixed(0))
    return unix;
  }

  // forecast dates
  for (let i = 0; i < forecast.length; i++) {
    forecast[i].textContent = weekDays[new Date(new Date().setDate(new Date().getDate() + i + 1)).getDay()]
    actualDates.push((toUnixTimestamp(`${year}-${month}-${days + i + 1} 16:00:00`)))
  }

  for (let index = 0; index < actualDates.length; index++) {
    for (let jndex = 0; jndex < weatherList.length; jndex++) {
      if (weatherList[jndex].dt == actualDates[index]) {
          allTemps[index].textContent = `${Math.round(weatherList[jndex].main.temp)}°`;
          allIcons[index].src = `http://openweathermap.org/img/wn/${weatherList[jndex].weather[0].icon}.png`
      }
    }
  }
  document.querySelector(".chart").innerHTML = `<canvas id="myChart" height="100%"></canvas>`
  getChart(weatherDetails)
}

const getChart = (weather) => {
  let {year, month, days, hours} = getCurrentTime();
  let date = `${year}-${month}-${days}`
  const weatherList = weather.list;

  const labels = [];
  const temps = [];

  if (hours > 21) {
    days++;
    date = `${year}-${month}-${days}`;
  }

  for (let i = 0; i < weatherList.length; i++) {
    if (fromUnixConverter(weatherList[i].dt) === date) {
      labels[i -1] = (weatherList[i].dt_txt).slice(10,16)
      temps[i - 1] = Math.round(weatherList[i].main.temp);
    }
  }

  const data = {
    labels: labels,
    datasets: [{
      label: `Temperature`,
      backgroundColor: 'rgb(138, 168, 194)',
      borderColor: 'rgb(138, 167, 194)',
      data: temps
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {}
  };

  const myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
}