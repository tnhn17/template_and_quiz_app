const quizContainer = document.getElementById("quiz-container");
const questionElement = document.getElementById("question");
const answersList = document.getElementById("answers-list");
const nextButton = document.getElementById("next-btn");
const resultContainer = document.getElementById("result-container");
const resultBody = document.getElementById("result-body");

let currentQuestionIndex = 0; // Index of the current question // Güncel sorunun indeksi
let score = 0;
let questions = [];
let questionIndices = [];
let countdownInterval; // Timer interval reference // Zamanlayıcı aralığı referansı
let isAnswerSelectable = false; // Flag to control answer selection // Cevap seçimini kontrol etmek için bayrak

function startQuiz() {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => {
      questions = data.map((item, index) => {
        const questionText = item.title;
        const answerOptions = parseAnswerOptions(item.body);
        const correctAnswer = item.userId;

        return {
          question: questionText,
          answers: answerOptions,
          correctAnswer: correctAnswer,
          userAnswer: null
        };
      });

      questionIndices = generateRandomIndices(questions.length, 10);

      showQuestion();

      const answerButtons = document.getElementsByClassName("answer-btn");
      for (let i = 0; i < answerButtons.length; i++) {
        answerButtons[i].disabled = true; // Cevap butonlarını devre dışı bırak
      }

      setTimeout(() => {
        nextButton.disabled = false; // "Next" butonunu etkinleştir
        isAnswerSelectable = true; // Cevap seçimini etkinleştir
        for (let i = 0; i < answerButtons.length; i++) {
          answerButtons[i].disabled = false; // Cevap butonlarını etkinleştir
        }
      }, 10000);
    })
    .catch(error => {
      console.log(error);
    });
}

function generateRandomIndices(maxRange, count) { // Generate random indices for questions // Sorular için rastgele dizinler oluştur
  const indices = [];
  while (indices.length < count) {
    const randomIndex = Math.floor(Math.random() * maxRange);
    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
    }
  }
  return indices;
}

function parseAnswerOptions(body) {   // Parse answer options from the question body // Soru gövdesinden cevap seçeneklerini ayrıştır
  const options = body.split("\n");
  const answerOptions = options.map((option, index) => {
    const letter = String.fromCharCode(65 + index); // Assign letters A, B, C, D to the options // Seçeneklere A, B, C, D harflerini atayın

    return {
      text: option.trim(),
      letter: letter
    };
  });

  return answerOptions;
}

function showQuestion() { // Show current question - Güncel soruyu göster
  if (currentQuestionIndex >= questionIndices.length) {
    showResult();
    return;
  }

  const currentQuestion = questions[questionIndices[currentQuestionIndex]];
  questionElement.textContent = currentQuestion.question;

  while (answersList.firstChild) {
    answersList.removeChild(answersList.firstChild);
  }

  currentQuestion.answers.forEach(answer => { // Add answer options to the list - Cevap seçeneğini ekle
    const answerItem = document.createElement("li");
    const answerButton = document.createElement("button");

    answerButton.textContent = `${answer.letter}. ${answer.text}`;
    answerButton.classList.add("answer-btn");
    answerButton.addEventListener("click", () => {
      selectAnswer(answer.letter);
    });

    answerItem.appendChild(answerButton);
    answersList.appendChild(answerItem);
  });

  nextButton.disabled = true;

  const answerButtons = document.getElementsByClassName("answer-btn");
  for (let i = 0; i < answerButtons.length; i++) {
    answerButtons[i].disabled = true; // Cevap butonlarını devre dışı bırak
  }

  resetCountdown(); // Reset countdown for each question // Her soru için geri sayımı sıfırla
  startCountdown(); // Start countdown for current question // Geçerli soru için geri sayımı başlat
  setTimeout(() => {
    nextButton.disabled = false; // Enable next button after 10 seconds // 10 saniye sonra sonraki düğmeyi etkinleştir
    isAnswerSelectable = true; // Enable answer selection after 10 seconds // 10 saniye sonra cevap seçimini etkinleştir
    for (let i = 0; i < answerButtons.length; i++) {
      answerButtons[i].disabled = false; // Cevap butonlarını etkinleştir 
    }
  }, 10000);
}

function selectAnswer(userAnswer) {
  if (!isAnswerSelectable) {
    return;
  }

  const currentQuestion = questions[questionIndices[currentQuestionIndex]];
  currentQuestion.userAnswer = userAnswer;
  nextButton.disabled = false;

  isAnswerSelectable = false; // Disable answer selection // Cevap seçimini devre dışı bırak

  setTimeout(() => {
    isAnswerSelectable = true; // Enable answer selection after 10 seconds // 10 saniye sonra cevap seçimini etkinleştir
  }, 10000);
}

function showResult() { // Show result table // Sonuç tablosunu göster
  quizContainer.style.display = "none";
  resultContainer.style.display = "block";

  resultBody.innerHTML = "";

  questions.forEach((question, index) => { // Add each question and user answer to the result table // Her soruyu ve kullanıcı cevabını sonuç tablosuna ekleyin
    if (question.userAnswer !== null && questionIndices.includes(index)) {
      const row = document.createElement("tr");
      const questionCell = document.createElement("td");
      const userAnswerCell = document.createElement("td");

      questionCell.textContent = question.question;
      userAnswerCell.textContent = question.userAnswer;

      row.appendChild(questionCell);
      row.appendChild(userAnswerCell);

      resultBody.appendChild(row);
    }
  });
  

  const restartButton = document.getElementById("restart-btn"); // Yeniden başlatma butonunu al

  if (!restartButton) { // Yeniden başlatma butonu yoksa
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart Quiz";
    restartButton.id = "restart-btn";
    restartButton.addEventListener("click", restartQuiz); // Yeniden başlatma işlevini tetikleyen olay dinleyicisi ekle
    const resultFooter = document.createElement("div"); // Yeni bir div oluştur
    resultFooter.classList.add("result-footer"); // result-footer sınıfını ekleyin
    resultFooter.appendChild(restartButton); // Yeniden başlatma butonunu div içine ekleyin
    resultContainer.appendChild(resultFooter); // Div'i resultContainer'a ekleyin
  } else {
    restartButton.style.display = "block"; // Daha önce oluşturulan butonu göster
  }
}


function restartQuiz() { // Restart quiz - Quiz'i yeniden başlat
  currentQuestionIndex = 0;
  score = 0;
  questionIndices = generateRandomIndices(questions.length, 10);

  showQuestion();
  resultContainer.style.display = "none";
  quizContainer.style.display = "block";

  const restartButton = document.getElementById("restart-btn"); // Yeniden başlatma butonunu al
  restartButton.style.display = "none"; // Yeniden başlatma butonunu gizle
}


function handleNextQuestion() // Handle next question - Sonraki soruyu ele al
 {
  currentQuestionIndex++;
  showQuestion();
}

function startCountdown() {
  let seconds = 30;
  countdownInterval = setInterval(() => {
    seconds--;
    if (seconds < 0) {
      clearInterval(countdownInterval);
      handleNextQuestion();
    }
  }, 1000);

  nextButton.disabled = true; // Disable next button at the start of the countdown // Geri sayımın başında sonraki düğmeyi devre dışı bırak
}

function resetCountdown() {
  clearInterval(countdownInterval);
}

nextButton.addEventListener("click", handleNextQuestion);

startQuiz();
