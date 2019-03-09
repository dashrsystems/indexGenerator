const source = `<!DOCTYPE html>
<html>
  <head>
    <!-- jQuery library -->
    <style>
      .event {
        background-color: white !important;
        color: black !important;
        box-shadow: none !important;
        /* text-align: center; */
      }

      .event-stat {
        margin-bottom: 0px !important;
        font-size: 20px !important;
      }

      .logo-wrapper {
        padding: 20px 0;
        text-align: center;
        width: 150px;
        height: 60px;
        margin-bottom: 40px;
      }


      .logo {
        width: 100%;
        height: auto;
      }

      .bold {
        font-weight: 700;
      }

      .stars i {
        display: inline;
        margin: 0px !important;
        font-size: 50px !important;
      }

      .index {
        text-align: center;
      }

      .name {
        text-align: center !important;
        font-size: 36px !important;
      }

      .heading-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .logo {
        font-family: Roboto;
        font-size: 24px;
        margin-left: 20px;
      }

      .logo-r {
        color: #1d88f2;
      }

      .athletic-performance-report {
        font-size: 14px;
        margin-right: 20px;
      }

      .chart-container {
        width: 500px;
        height: 500px;
        margin: auto;
      }

      .previous-index {
        font-size: 8px !important;
      }

      .overall-athlete-index {
        font-size: 32px !important;
      }

      .test {
        padding-top: 0px !important;
        padding-bottom: 0px !important;
      }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.bundle.min.js"></script>
    <link href="styles.css" rel="stylesheet" />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
      integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr"
      crossorigin="anonymous"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Roboto"
      rel="stylesheet"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.bundle.min.js"></script>
  </head>
  <body>
    <div class="heading-container">
    <div class="logo-wrapper"><img class="logo" src="https://imgur.com/YFAejbO.png" /></div>
    <div class="athletic-performance-report">Athletic Performance Report</div>
    </div>
    <hr />
    <div class="title name">{{name}}</div>
    <div class="columns is-multiline">
      <div class="column">
        <div class="box notification is-primary event test">
          <div class="heading"><span class="bold">SPORT: </span>{{sport}}</div>
          <div class="heading">
            <span class="bold">POSITION: </span>{{position}}
          </div>
          <div class="heading"><span class="bold">AGE: </span>{{age}}</div>
        </div>
      </div>
      <div class="column">
        <div class="box notification is-primary event test">
          <div class="heading">
            <span class="bold">HEIGHT: </span>{{feet}} FT. {{inches}} IN.
          </div>
          <div class="heading"><span class="bold">WEIGHT: </span>{{weight}} LBS</div>
        </div>
      </div>
      <div class="column">
        <div class="box notification is-primary event test">
          <div class="heading"><span class="bold">WING SPAN: </span>{{wingSpan}} IN.</div>
          <div class="heading"><span class="bold">REACH: </span>{{reach}} IN.</div>
        </div>
      </div>
    </div>
    <div class="columns is-multiline">
      <div class="column">
        <div class="box notification is-primary event test">
          <div class="heading">Vertical</div>
          <div class="title event-stat">{{vert}} IN.</div>
          <div class="heading previous-index">INDEX: {{vertIndex}}</div>
        </div>
      </div>
      <div class="column">
        <div class="box notification is-warning event test">
          <div class="heading">Pro-Agility</div>
          <div class="title event-stat">{{agility}} SEC</div>
          <div class="heading previous-index">INDEX: {{agilityIndex}}</div>
        </div>
      </div>
      <div class="column">
        <div class="box notification is-info event test">
          <div class="heading">10 Yard Dash</div>
          <div class="title event-stat">{{ten}} SEC</div>
          <div class="heading previous-index">INDEX: {{tenIndex}}</div>
        </div>
      </div>
    </div>
    <div class="chart-container">
      <canvas id="myChart"></canvas>
    </div>

    <div class="index">
      <div class="heading overall-athlete-index">EPIC ATHLETE INDEX</div>
      <div class="title event-stat overall-athlete-index">{{overallIndex}}</div>
    </div>
  </body>
  <script>
    Chart.defaults.global.defaultFontFamily = "Roboto";
    Chart.defaults.global.defaultFontColor = "#000";

    var options = {
      legend: {
        display: false
      },
      responsive: false,
      maintainAspectRatio: true,
      scale: {
        ticks: {
          beginAtZero: true,
          max: 600,
          stepSize: 150
        }
      },
      layout: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    };

    let data = {
      labels: ["Vertical", "Pro-Agility", "10 Yard Dash"],
      datasets: [
        {
          data: [{{vertIndex}}, {{agilityIndex}}, {{tenIndex}}],
          backgroundColor: ["rgba(29, 136, 242, 0.2)"],
          borderColor: ["rgba(29, 136, 242, 1)"]
        }
      ]
    };

    var ctx = document.getElementById("myChart").getContext("2d");
    ctx.canvas.width = 500;
    ctx.canvas.height = 500;
    var myRadarChart = new Chart(ctx, {
      type: "radar",
      data: data,
      options: options
    });
  </script>
</html>
`;

exports.source = source;
