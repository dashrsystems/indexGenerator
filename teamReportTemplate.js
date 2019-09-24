const source = `
<!DOCTYPE html>
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

            .roster-name {
                text-align: center !important;
                font-size: 32px !important;
            }

            .testingDate {
                text-align: center !important;
                font-size: 15px !important;
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
                font-size: 20px !important;
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
            <div class="logo-wrapper">
                <img class="logo" src="https://imgur.com/YFAejbO.png" />
            </div>
            <div class="athletic-performance-report">
                Team Report
            </div>
        </div>
        <hr />
        <div class="title name">EPIC INDEX TEAM REPORT</div>
        <div class="title roster-name">{{rosterName}}</div>
        <div class="index">
            <div class="heading overall-athlete-index">
                AVERAGE EPIC ATHLETE INDEX: {{averageEpicIndex}}
            </div>
        </div>
        <div class="chart-container">
            <canvas id="barChart"></canvas>
        </div>
        <div class="chart-container">
            <canvas id="radarChart"></canvas>
        </div>
    </body>
    <script>
        Chart.defaults.global.defaultFontFamily = 'Roboto';
        Chart.defaults.global.defaultFontColor = '#000';

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

        let radarData = {
            labels: [
                ['10 Yard Dash', 'Avg Index: {{averageDashIndex}}', 'Range: {{dashRangeMin}}-{{dashRangeMax}}'],
                ['Pro-Agility', 'Avg Index: {{averageProAgilityIndex}}', 'Range: {{proAgilityRangeMin}}-{{proAgilityRangeMax}}'],
                ['Vertical', 'Avg Index: {{averageVerticalIndex}}', 'Range: {{verticalRangeMin}}-{{verticalRangeMax}}']
            ],
            datasets: [
                {
                    data: [{{averageDashIndex}}, {{averageProAgilityIndex}}, {{averageVerticalIndex}}],
                    backgroundColor: ['rgba(29, 136, 242, 0.2)'],
                    borderColor: ['rgba(29, 136, 242, 1)']
                }
            ]
        };

        let barLabels = [];
        let dataBar = [];

        {{#each athleteNames}}
            barLabels.push('{{this}}');
        {{/each}}

        {{#each athleteIndexes}}
            dataBar.push({{this}});
        {{/each}}

        let barData = {
            labels: barLabels,
            datasets: [
                {
                    data: dataBar,
                    backgroundColor: 'rgba(29, 136, 242, 1)',
                    borderColor: 'rgba(29, 136, 242, 1)',
                    hoverBackgroundColor: 'rgba(29, 136, 242, 1)',
                    hoverBorderColor: 'rgba(29, 136, 242, 1)'
                }
            ]
        };

        var ctx = document.getElementById('barChart').getContext('2d');
        ctx.canvas.width = 500;
        ctx.canvas.height = 500;
        var myBarChart = new Chart(ctx, {
            type: 'bar',
            data: barData,
            options: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'EPIC INDEX SCORES'
                },
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            }
        });
        var ctx2 = document.getElementById('radarChart').getContext('2d');
        ctx2.canvas.width = 500;
        ctx2.canvas.height = 500;
        var myRadarChart = new Chart(ctx2, {
            type: 'radar',
            data: radarData,
            options: {
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
            }
        });
    </script>
</html>
`;

exports.source = source;
