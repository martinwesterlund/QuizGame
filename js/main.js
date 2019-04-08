var questionIndex = 0;
var res;
var question;
var answers;
var alternatives = [];
var alternative;
var selectedAnswer;
var score = 0;
var progress = 0;
var amountQuestions;
var category;

//Loading questions from OpenTDB Api when clicking on "load quiz" at the start page
function loadQuestionsFromDatabase() {

    hideOptions();
    //Getting values from selection panel
    amountQuestions = document.getElementById("amountQuestions").value;
    var category = "&category=" + document.getElementById("category").value;
    if (amountQuestions == "random") {
        amountQuestions = 10;
    }
    if (category == "&category=random") {
        category = "";
    }

    //Deciding which URL to get questions from
    var url = `https://opentdb.com/api.php?amount=${amountQuestions}${category}`;

    //Making HttpRequest
    var httpRequest = new XMLHttpRequest;

    httpRequest.onreadystatechange = function () {
        console.log(this.readyState);
        if (this.readyState == 4) {
            if (this.status == 200) {
                //As soon as the readyState is DONE, the "Start game"-button becomes visible
                document.getElementById("startGame").style.display = "block";
                res = JSON.parse(this.responseText);
            } else {
                console.log("HTTP-status är inte 200, utan" + httpRequest.status);
            }
        }
    }
    httpRequest.open('GET', url);
    httpRequest.send();

    //Add event listener to the start-button. 
    document.getElementById("startGame").addEventListener("click", hideStartButton);
}

//Updates the progress bar on request
function updateProgressBar() {
    var prg = document.getElementById("progress");

    //Makes the progress bar slide and not just jump
    var id = setInterval(changeBar, 35);

    //Calculates how far the bar should go in each question
    var currentProgress = Math.floor(questionIndex * (100 / amountQuestions));

    //Changes the current length of the bar
    function changeBar() {
        if (progress == currentProgress) {
            clearInterval(id);
        } else {
            progress += 1;
            prg.style.width = progress + "%";
        }
    }
}

//Hiding options when playing
function hideOptions() {
    document.getElementById("options").style.display = "none";
}

//Hiding start button when playing
function hideStartButton() {
    document.getElementById("startGame").classList.toggle("hidden");
    showQuestion();
}

//Showing next question
function showQuestion() {
    
    //Check if the quiz is over
    if (questionIndex >= amountQuestions) {
        showResult();
    }
    
    try {
        showScore();
        showAlternatives();
        updateProgressBar();
        document.getElementById("progress-bar").style.display = "block";
        document.getElementById("message").innerHTML = "Question # " + (questionIndex + 1);
        document.getElementById("question").innerHTML = res.results[questionIndex].question;
    } catch (err) {
        console.error("No more questions in this quiz");
    }
}

//Check to see if the question only has true/false alternatives. If so, the alternative 3 & 4 buttons should not be visible
function checkIfOnlyTwoAlternatives(amountOfAlternatives) {
    if (amountOfAlternatives == 2) {
        document.getElementById("alternative3").style.display = "none";
        document.getElementById("alternative4").style.display = "none";
    }
}

//Shows the current score
function showScore() {
    document.getElementById("score").innerHTML = "Score: " + score;
}

//Showing alternatives to each question
function showAlternatives() {
    enableAlternativeButtons();
    //Amount of alternatives is always the sum of all incorrect answers + 1 (the correct answer)
    var amountOfAlternatives = res.results[questionIndex].incorrect_answers.length + 1;
    checkIfOnlyTwoAlternatives(amountOfAlternatives);

    //Creating array with all alternatives
    alternatives = res.results[questionIndex].incorrect_answers;
    alternatives.push(res.results[questionIndex].correct_answer);

    //Since we are going to pick one alternative at the time, we create a new variable with the decreasing list of alternatives
    var remainingAlternatives = Array.from(alternatives);

    //Picks random alternatives to be displayed in each alternative button
    for (var i = 1; i <= amountOfAlternatives; i++) {
        randomValue = Math.floor(Math.random() * remainingAlternatives.length);
        this.alternative = document.getElementById("alternative" + i);
        this.alternative.innerHTML = remainingAlternatives.splice(randomValue, 1);
        this.alternative.style.display = "block";
    }
}

//Check to see if the answer is correct or not
function checkAnswer(id) {
    disableAlternativeButtons();
    selectedAnswer = document.getElementById(id);
    if (selectedAnswer.innerHTML == decodeHtml(res.results[questionIndex].correct_answer)) {
        selectedAnswer.style.backgroundColor = "green";
        score++;
        showScore();
    } else {
        selectedAnswer.style.backgroundColor = "red";

        for (var i = 1; i <= alternatives.length; i++) {
            if (document.getElementById("alternative" + i).innerHTML == decodeHtml(res.results[questionIndex].correct_answer)) {
                document.getElementById("alternative" + i).style.backgroundColor = "green";
            }
        }
    }
    questionIndex++;
    updateProgressBar();

    //Wait for two seconds before moving on to the next question
    setTimeout(function () {
        changeButtonColorsToDefault();
        showQuestion();
    }, 2000);
}

//Decoding all special symbols. "´" instead of &#39; for example. 
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

//Lock all alternative buttons when you have selected one of them 
function disableAlternativeButtons() {
    document.getElementById("alternative1").disabled = true;
    document.getElementById("alternative2").disabled = true;
    document.getElementById("alternative3").disabled = true;
    document.getElementById("alternative4").disabled = true;
}

//Make the alternative buttons clickable to the next question
function enableAlternativeButtons() {
    document.getElementById("alternative1").disabled = false;
    document.getElementById("alternative2").disabled = false;
    document.getElementById("alternative3").disabled = false;
    document.getElementById("alternative4").disabled = false;
}

//Change all alternative button's color to default
function changeButtonColorsToDefault() {
    for (var i = 1; i < 5; i++) {
        document.getElementById("alternative" + i).style.backgroundColor = "#202020";
    }
}

//Showing the final result
function showResult() {
    document.getElementById("message").innerHTML = "Your score was: " + score + " out of " + amountQuestions;
    hideProgressBar();
    hideScore();
    hideAlternativeButtons();
    hideQuestion();
    document.getElementById("startGame").innerHTML = "Play again!";
    document.getElementById("startGame").addEventListener("click", restartGame);
    document.getElementById("startGame").classList.toggle("hidden");
}

function hideProgressBar() {
    document.getElementById("progress-bar").style.display = "none";
}

function hideScore() {
    document.getElementById("score").style.display = "none";
}

function hideAlternativeButtons() {
    document.getElementById("alternativeList").style.display = "none";
}

function hideQuestion() {
    document.getElementById("question").style.display = "none";
}

function restartGame() {
    location.reload();
}




