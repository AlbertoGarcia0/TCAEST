const questions = [];
var testQuestions = [];


// Función para cargar las opciones del selector de temas
function loadThemes() {
    fetch('DB/database_info.json') // Ruta al archivo database_info.json
        .then(response => response.json())
        .then(data => {
            const themeSelector = document.getElementById("themeSelector");

            // Agregar una opción para "Todo" si es necesario
            // const optionTodo = document.createElement("option");
            // optionTodo.value = "Todo";
            // optionTodo.textContent = "Todo";
            // themeSelector.appendChild(optionTodo);

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
    if (numQuestions < 1 || numQuestions > 100) {
        alert("El número de preguntas debe estar entre 1 y 100.");
        return;
    }

    // Validar el tiempo límite
    if (timeLimit < 5 || timeLimit > 90) {
        alert("El tiempo límite debe estar entre 5 y 90 minutos.");
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
        document.getElementById("getResultsBtn").style.display = "inline";
        const results = document.getElementById("results");
        results.innerHTML = "";

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
                        let answerHTML = `
                            <li>
                                <label class="radio-label" for="q${i}-${index}">
                                    <input type="radio" id="q${i}-${index}" name="q${i}" value="${index}" disabled
                                        ${userAnswer === (index + 1) ? 'checked' : ''}>
                                    ${answer}
                                </label>
                            </li>
                        `;

                        if (userAnswer === correctAnswer && userAnswer === (index + 1)) {
                            answerHTML += `<span style="color: green;"><b>${answer}</b></span>`;
                        } else if (userAnswer !== correctAnswer && userAnswer === (index + 1)) {
                            answerHTML += `<span style="color: red;">${answer}</span>`;
                        } else if (correctAnswer === (index + 1)) {
                            answerHTML += `<span style="color: green;"><b>${answer}</b></span>`;
                        } else {
                            answerHTML += answer;
                        }

                        answerHTML += `</li>`;
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
    const results = document.getElementById("results");
    results.innerHTML = generateResults(); // Llama a una función para generar los resultados
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
    document.getElementById("finishTestBtn").style.display = "none";
    results.classList.add("hidden");
}


// Llamar a la función para cargar las opciones del selector de temas al cargar la página
loadThemes();
