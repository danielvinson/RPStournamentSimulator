$(document).ready(function(){ 

    $('#simulateButton').click(function(){
        // Update data, then re-run simulation
        var rockPlayers = $('#rockInput').val();
        var paperPlayers = $('#paperInput').val();
        var scissorsPlayers = $('#scissorsInput').val();
        var numberOfRounds = $('#roundsInput').val();
        var numberOfTrials = $('#trialsInput').val();

        console.log("Running Simulation with: ");
        console.log("   Rock: " + rockPlayers);
        console.log("   Paper: " + paperPlayers);
        console.log("   Scissors: " + scissorsPlayers);
        console.log("   Rounds: " + numberOfRounds);
        console.log("   Trials: " + numberOfTrials);

        var simulationData = runSimluation(rockPlayers, paperPlayers, scissorsPlayers, numberOfRounds, numberOfTrials);
        var rockSeries = { name: 'Rock', data: [] };
        var paperSeries = { name: 'Paper', data: [] };
        var scissorsSeries = {name: 'Scissors', data: []};

        console.log(simulationData);

        // Ignores all but the last trial right now... need to fix
        for (var trialResult in simulationData){
            for (var round in simulationData[trialResult]){
                var rock = 0, paper = 0, scissors = 0;
                for (var deck in simulationData[trialResult][round]){
                    if (simulationData[trialResult][round][deck] == "Rock"){ rock++ }
                    if (simulationData[trialResult][round][deck] == "Paper"){ paper++ }
                    if (simulationData[trialResult][round][deck] == "Scissors"){ scissors++ }
                }
                rockSeries.data.push(rock);
                paperSeries.data.push(paper);
                scissorsSeries.data.push(scissors);
            }
        }

        options = initializeChartOptions(numberOfRounds);
        options.series.push(rockSeries, paperSeries, scissorsSeries);
        chart = new Highcharts.Chart(options);
    });
});

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function runSimluation(rockPlayers, paperPlayers, scissorsPlayers, numberOfRounds, numberOfTrials){

    var trialResults = [];
    for (var trial = 0; trial < numberOfTrials; trial++){
        var roundResultData = {};

        // Generate initial field
        var field = [];
        for (var rocks = 0; rocks < rockPlayers; rocks++){ field.push("Rock")}
        for (var papers = 0; papers < paperPlayers; papers++){ field.push("Paper")}
        for (var scissors = 0; scissors < scissorsPlayers; scissors++){ field.push("Scissors")}

        roundResultData['0'] = JSON.parse(JSON.stringify(field));

        // Simulate the rounds
        for (var round = 1; round <= numberOfRounds; round++){
            var field = simulateRoundSingleElim(field)
            roundResultData[round] = JSON.parse(JSON.stringify(field));
        }

        trialResults.push(roundResultData);
    }
    // Merge trial data
    return trialResults;
}

function simulateRoundSingleElim(field){
    if (field.length == 1){
        return field
    }
    var newField = field;
    shuffle(newField);
    if (newField.length % 2){
        newField.push("Bye");
    }
    var bracket1 = newField.splice(0,(newField.length / 2));
    var bracket2 = newField;
    var winners = [];
    for (var deck in bracket1){
        var winner = computeWinner(bracket1[deck],bracket2[deck]);
        winners.push(winner);
    }
    return winners
}


function computeWinner(player1, player2){
    if (player1 == "Rock"){
        if (player2 == "Rock"){ return "Rock"} // We don't care who wins the mirror for single elim
        else if (player2 == "Paper"){ return "Paper"}
        else if (player2 == "Scissors"){ return "Rock"}
        else if (player2 == "Bye"){ return "Rock"}
    } else if (player1 == "Paper"){
        if (player2 == "Rock"){ return "Paper"}
        else if (player2 == "Paper"){ return "Paper"}
        else if (player2 == "Scissors"){ return "Scissors"}
        else if (player2 == "Bye"){ return "Paper"}
    } else if (player1 == "Scissors"){
        if (player2 == "Rock"){ return "Rock"}
        else if (player2 == "Paper"){ return "Scissors"}
        else if (player2 == "Scissors"){ return "Scissors"}
        else if (player2 == "Bye"){ return "Scissors"}
    } else if (player1 == "Bye"){
        return player2
    }
}


function initializeChartOptions(numberOfRounds){
    // Returns an Options object with default values.
    var roundList = [];
    for (var round = 1; round <= numberOfRounds; round++){
        roundList.push(round);
    }
    var options = {
        chart: {
            type: 'area',
            renderTo: 'chartContainer'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: roundList,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'Percent of Field'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})<br/>',
            split: true
        },
        plotOptions: {
            area: {
                stacking: 'percent',
                lineColor: '#ffffff',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#ffffff'
                }
            }
        },
        series: []
    };
    console.log(options);
    return options;
}