$(document).ready(function () {
  $("#search-button").on("click", function () {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function () {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: `http://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&appid=245a8f56328f7aa62b487fc71a572af9`,
      dataType: "json",
    }).then(
      function (data) {

        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
          makeRow(searchValue);
        }
        console.log(data);
        console.log(data.list[0].wind.speed);
        console.log(data.list[0].main.humidity);
        console.log(data.list[0].main.temp);
        console.log(data.city.coord.lat);
        console.log(data.city.coord.lon);
        console.log(data.list[0].weather[0].icon);
        console.log(data.city.name);

        $("#today").html(`<h3 class=\"mt-3\">${data.city.name + " (" + new Date().toLocaleDateString()})</h3><br/> <img src="http://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png" alt="Weather Image"><br/>Wind Speed: ${data.list[0].wind.speed} MPH<br/>Humidity: ${data.list[0].main.humidity} % <br/>Temperature: ${data.list[0].main.temp}°F`);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.city.coord.lat, data.city.coord.lon);
      })
  };


  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: `http://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&appid=245a8f56328f7aa62b487fc71a572af9`,
      dataType: "json"
    }).then(
      function (data) {

        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + ((data.list[i].main.temp_min -32) / 1.8).toFixed(2)  + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    );
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=245a8f56328f7aa62b487fc71a572af9`,
      dataType: "json"
    }).then(
      function (data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.current.uvi);

        console.log(data.current.uvi);
        // change color depending on uv value
        if (data.current.uvi < 3) {
          btn.addClass("btn-success");
        }
        else if (data.current.uvi < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }

        $("#today .card-body").append(uv.append(btn));
      }
    );
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];
  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
