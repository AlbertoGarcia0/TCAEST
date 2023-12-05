const questions = [];
var testQuestions = [];
let countdownInterval; // Variable para almacenar el intervalo del temporizador


// Función para cargar las opciones del selector de temas
function loadThemes() {
    fetch('DB/database_info.json') // Ruta al archivo database_info.json
        .then(response => response.json())
        .then(data => {
            const themeSelector = document.getElementById("themeSelector");

            // Agregar opciones para cada categoría desde database_info.json
            data.categorias.forEach(category => {
                const option = document.createElement("option");
                option.value = category.nombre_categoria;
                option.textContent = category.nombre_categoria;
                themeSelector.appendChild(option);
            });
        })
        .catch(error => {
            console.error(`Error al cargar las opciones de temas: ${error}`);
        });
}


// Definir una función para cargar preguntas basada en la categoría seleccionada
function loadQuestionsByCategory(category) {
    const categoryPath = `DB/${category}/preguntas.json`;

    return new Promise((resolve, reject) => {
        fetch(categoryPath)
            .then(response => response.json())
            .then(data => {
                questions.length = 0; // Limpia el arreglo de preguntas
                for (let i = 0; i < data.Preguntas.length; i++) {
                    const question = data.Preguntas[i];
                    questions.push(question);
                }
                resolve(); // Resuelve la promesa una vez que las preguntas estén cargadas
            })
            .catch(error => {
                reject(`Error al cargar las preguntas: ${error}`);
            });
    });
}

// Función para iniciar el test
async function startTest() {
    const theme = document.getElementById("themeSelector").value;
    const numQuestions = parseInt(document.getElementById("numQuestions").value);
    const timeLimit = parseInt(document.getElementById("timeLimit").value);

    // Validar el número de preguntas
    if (numQuestions < 1 || numQuestions > 105) {
        alert("El número de preguntas debe estar entre 1 y 105.");
        return;
    }

    // Validar el tiempo límite
    if (timeLimit < 5 || timeLimit > 120) {
        alert("El tiempo límite debe estar entre 5 y 120 minutos.");
        return;
    }
    try {
        await loadQuestionsByCategory(theme); // Espera a que se carguen las preguntas
        console.log("questions");
        console.log(questions);
        console.log(questions.length);
        // Mezcla las preguntas para presentarlas en orden aleatorio
        const shuffledQuestions = shuffleArray(questions);
        console.log("shuffledQuestions");
        console.log(shuffledQuestions);

        // Toma las primeras 'numQuestions' preguntas
        const selectedQuestionsSubset = shuffledQuestions.slice(0, numQuestions);
        console.log("selectedQuestionsSubset");
        console.log(selectedQuestionsSubset);
        testQuestions = selectedQuestionsSubset;

        // Genera el formulario de preguntas
        const quiz = document.getElementById("quiz");
        quiz.innerHTML = "";
        for (let i = 0; i < selectedQuestionsSubset.length; i++) {
            const question = selectedQuestionsSubset[i];
            const questionHTML = `
                <div class="question">
                    <h3>Pregunta ${i + 1}:</h3>
                    <p>${question.enunciado}</p>
                    <ul>
                        ${question.respuestas.map((answer, index) => `
                            <li>
                                <input type="radio" name="q${i}" value="${index}">
                                ${answer}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            quiz.innerHTML += questionHTML;
            
        }


        // Oculta los elementos de configuración y muestra el test

        document.getElementById("themeSelector").setAttribute("disabled", "disabled");
        document.getElementById("numQuestions").setAttribute("disabled", "disabled");
        document.getElementById("timeLimit").setAttribute("disabled", "disabled");
        document.getElementById("quiz").classList.remove("hidden");
        document.getElementById("results").classList.add("hidden");
        document.getElementById("startTestBtn").style.display = "none";
        document.getElementById("getResultsBtn").style.display = "inline";
        document.getElementById("floating-clock").style.display = "inline";
        const results = document.getElementById("results");
        results.innerHTML = "";
        const testStartTime = new Date().getTime();
        localStorage.setItem("testStartTime", testStartTime);
        // Ocultar los resultados y el botón de mostrar resultados
        document.getElementById("mostrarResultadosButton").style.display = "none";
        document.getElementById("resultadosContainer").style.display = "none";
        resultadosContainer.innerHTML = "";

        // Iniciar el temporizador
        countdownInterval = setInterval(function () {
            const secondsRemaining = getCurrentTimeRemaining();
            if (secondsRemaining <= 0) {
                stopTimer()
                getResults();
            }
        }, 1000);
    
        // Llamar a la función para actualizar el reloj flotante
        updateFloatingClock();
        // Aquí puedes implementar la lógica para el temporizador si es necesario
    } catch (error) {
        console.error(error);
    }
}


function shuffleArray(array) {
    console.log(array.length);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateFloatingClock() {
    const floatingClock = document.getElementById('floating-clock');

    // Verificar si el test está en progreso
    const isTestInProgress = !document.getElementById("quiz").classList.contains("hidden");

    if (isTestInProgress) {
        // Si hay un test en progreso, mostrar la cuenta regresiva
        const countdownElement = document.getElementById("floating-clock");

        // Obtener el tiempo restante
        const secondsRemaining = getCurrentTimeRemaining();

        // Mostrar el tiempo restante formateado
        countdownElement.textContent = formatTime(secondsRemaining);
    } else {
        // Si no hay un test en progreso, ocultar el reloj flotante
        floatingClock.textContent = "";
    }

    // Llamar a la función cada segundo para actualizar el reloj
    setTimeout(updateFloatingClock, 1000);
}


function getCurrentTimeRemaining() {
    // Obtener el tiempo restante en segundos
    const timeLimit = parseInt(document.getElementById("timeLimit").value);
    let secondsRemaining = timeLimit * 60;
    const now = new Date();
    const testStartTime = parseInt(localStorage.getItem("testStartTime"));
    const elapsedSeconds = Math.floor((now - testStartTime) / 1000);
    secondsRemaining -= elapsedSeconds;

    return secondsRemaining > 0 ? secondsRemaining : 0;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(countdownInterval);
    document.getElementById("floating-clock").style.display = "none";
}



function generateResults() {
    let score = 0; // Inicializa el puntaje
    let unanswered = 0; // Inicializa el contador de preguntas sin responder
    let wrong = 0; // Inicializa el contador de respuestas incorrectas

    for (let i = 0; i < testQuestions.length; i++) {
        const userAnswer = getSelectedAnswer(i);
        const correctAnswer = testQuestions[i].verdadera;

        if (userAnswer === correctAnswer) {
            score++; // Respuesta correcta
        } else if (userAnswer === null) {
            unanswered++; // Pregunta sin respuesta
        } else {
            wrong++; // Respuesta incorrecta
        }
    }
    let nota= (score-(wrong*0.33))/testQuestions.length*10;
    nota = Math.max(0, Math.min(10, nota));

    let resultsHTML = `
        <h2>Resultados</h2>
        <p>Puntuación: ${nota}</p>
        <p>Preguntas bien respondidas: ${score}</p>
        <p>Respuestas incorrectas: ${wrong}</p>
        <p>Preguntas sin responder: ${unanswered}</p>
    `;

    for (let i = 0; i < testQuestions.length; i++) {
        const userAnswer = getSelectedAnswer(i);
        const correctAnswer = testQuestions[i].verdadera;
        const question = testQuestions[i];
    
        resultsHTML += `
            <div class="question">
                <h3>Pregunta ${i + 1}:</h3>
                <p>${question.enunciado}</p>
                <ul>
                    ${question.respuestas.map((answer, index) => {
                        let classes = '';
    
                        // Determinar la clase según la respuesta
                        if (userAnswer === (index + 1)) {
                            classes += (userAnswer === correctAnswer) ? 'user-answer-correct ' : 'user-answer-incorrect ';
                        } else if (correctAnswer === (index + 1)) {
                            classes += 'correct-answer ';
                        } else {
                            classes += 'normal-answer ';
                        }
    
                        let answerHTML = `
                            <li class="${classes}">
                                <label class="radio-label" for="q${i}-${index}">
                                    <input type="radio" id="q${i}-${index}" name="q${i}" value="${index}" disabled
                                        ${userAnswer === (index + 1) ? 'checked' : ''}>
                                    ${answer}
                                </label>
                            </li>
                        `;
    
                        return answerHTML;
                    }).join('')}
                </ul>
            </div>
        `;
    }

    // Limpiar las respuestas del usuario
    const quiz = document.getElementById("quiz");
    document.getElementById("getResultsBtn").style.display = "none";
    document.getElementById("finishTestBtn").style.display = "inline";
    quiz.innerHTML = "";
    return resultsHTML;
}

function calcularPuntuacion() {
    let score = 0; // Inicializa el puntaje
    let unanswered = 0; // Inicializa el contador de preguntas sin responder
    let wrong = 0; // Inicializa el contador de respuestas incorrectas

    for (let i = 0; i < testQuestions.length; i++) {
        const userAnswer = getSelectedAnswer(i);
        const correctAnswer = testQuestions[i].verdadera;

        if (userAnswer === correctAnswer) {
            score++; // Respuesta correcta
        } else if (userAnswer === null) {
            unanswered++; // Pregunta sin respuesta
        } else {
            wrong++; // Respuesta incorrecta
        }
    }

    // Calcular la puntuación según la fórmula proporcionada
    let nota = (score - (wrong * 0.33)) / testQuestions.length * 10;

    // Asegurarse de que la puntuación esté en el rango de 0 a 10
    nota = Math.max(0, Math.min(10, nota));

    return nota;
}


function scrollToResults() {
    const results = document.getElementById("results");
    const resultsY = results.getBoundingClientRect().top + window.scrollY;
    const initialY = window.scrollY;
    const difference = resultsY - initialY;
    const duration = 1000; // Duración en milisegundos

    let start;

    function step(timestamp) {
        if (!start) {
            start = timestamp;
        }

        const progress = timestamp - start;
        window.scrollTo(0, initialY + (progress / duration) * difference);

        if (progress < duration) {
            requestAnimationFrame(step);
        } else {
            window.scrollTo(0, resultsY);
        }
    }

    requestAnimationFrame(step);
}

function getResults() {
    // Obtener el tiempo total que duró el test
    const testEndTime = new Date().getTime();
    const testStartTime = parseInt(localStorage.getItem("testStartTime"));
    const testDurationInSeconds = Math.floor((testEndTime - testStartTime) / 1000);

    // Almacenar los resultados en el localStorage
    const resultadosAnteriores = JSON.parse(localStorage.getItem("resultados")) || [];
    const nuevosResultados = {
        timestamp: new Date().toISOString(),
        score: calcularPuntuacion(), // Implementa la función según tus necesidades
        duration: testDurationInSeconds,
        // Otros datos que quieras almacenar
    };

    
    // Agregar los nuevos resultados a la lista de resultados anteriores
    resultadosAnteriores.push(nuevosResultados);

    // Guardar la lista actualizada en el localStorage
    localStorage.setItem("resultados", JSON.stringify(resultadosAnteriores));

    // Detener el temporizador antes de mostrar los resultados
    stopTimer();
    const results = document.getElementById("results");
    results.innerHTML = generateResults();
    results.classList.remove("hidden");
    scrollToResults();
}


function getSelectedAnswer(questionIndex) {
    const radioButtons = document.getElementsByName(`q${questionIndex}`);
    
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            console.log(parseInt(radioButton.value)+1);
            return parseInt(radioButton.value)+1;
        }
    }
    return null; // Si no se seleccionó ninguna respuesta
}

const mostrarResultadosButton = document.getElementById("mostrarResultadosButton");

mostrarResultadosButton.addEventListener("click", mostrarResultadosAlmacenados);

function mostrarResultadosAlmacenados() {
    const resultadosGuardados = JSON.parse(localStorage.getItem("resultados")) || [];

    // Ordenar los resultados por orden cronológico descendente (de la más reciente a la más antigua)
    resultadosGuardados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Mostrar los resultados en el contenedor HTML
    const resultadosContainer = document.getElementById("resultadosContainer");
    resultadosContainer.innerHTML = ""; // Limpiar el contenido anterior

    let fechaAnterior = null;

    resultadosGuardados.forEach(resultado => {
        const listItem = document.createElement("li");
        const fecha = new Date(resultado.timestamp);
        const fechaFormateada = `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;

        // Mostrar la fecha solo si es diferente de la anterior o si es la primera iteración
        if (fechaAnterior !== null && fechaAnterior.toDateString() !== fecha.toDateString()) {
            listItem.innerHTML = `<h3>${fecha.toDateString()}</h3>`;
            resultadosContainer.appendChild(listItem);
        } else if (fechaAnterior === null) {
            listItem.innerHTML = `<h3>${fecha.toDateString()}</h3>`;
            resultadosContainer.appendChild(listItem);
        }

        // Determinar el ícono (tick en verde o cruz en rojo) según la puntuación
        const iconClass = resultado.score >= 5 ? "check" : "cross";

        listItem.innerHTML = `
            <span class="${iconClass}">${resultado.score >= 5 ? '✔' : '✘'}</span>
            <span>Puntuación: ${resultado.score}</span>
            <span>Duración: ${formatTime(resultado.duration)}</span>
            <span>${fechaFormateada}</span>
        `;

        resultadosContainer.appendChild(listItem);

        fechaAnterior = fecha;
    });
}

function finishTest() {
    // Habilitar el selector de temas, el número de preguntas y el tiempo límite.
    document.getElementById("themeSelector").removeAttribute("disabled");
    document.getElementById("numQuestions").removeAttribute("disabled");
    document.getElementById("timeLimit").removeAttribute("disabled");

    // Limpiar las respuestas del usuario
    const quiz = document.getElementById("quiz");
    quiz.innerHTML = "";

    // Ocultar la sección de resultados
    const results = document.getElementById("results");
    results.innerHTML = "";
    results.classList.add("hidden");

    // Detener el temporizador
    stopTimer();


    // Ocultar el botón de "Finalizar Test" y mostrar el de "Obtener Resultados"
    document.getElementById("finishTestBtn").style.display = "none";
    document.getElementById("startTestBtn").style.display = "inline";
    document.getElementById("mostrarResultadosButton").style.display = "inline";
    document.getElementById("resultadosContainer").style.display = "inline";
resultadosContainer.innerHTML = "";

}

// Llamada a la función para cargar las opciones del selector de temas al cargar la página
loadThemes();

// Llamada a la función para iniciar el reloj flotante
updateFloatingClock();
