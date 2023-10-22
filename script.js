const questions = [];
var testQuestions = [];

// Definir una función para cargar preguntas basada en la categoría seleccionada
function loadQuestionsByCategory(category) {
    const categoryPath = `DB/${category}/preguntas.json`;
    // Realizar una solicitud AJAX o utilizar fetch para cargar el archivo JSON
    // Dentro de la función loadQuestionsByCategory
    fetch(categoryPath)
    .then(response => response.json())
    .then(data => {
        // Asignar directamente los datos a 'questions'
        questions.length = 0; // Limpia el arreglo de preguntas
        for (let i = 0; i < data.Preguntas.length; i++) {
            const question = data.Preguntas[i];
            questions.push(question);
        }
    })
    .catch(error => {
        console.error(`Error al cargar las preguntas: ${error}`);
    });

}

// Función para iniciar el test
function startTest() {
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

    // Cargar las preguntas de la categoría seleccionada
    loadQuestionsByCategory(theme);
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

    // Aquí puedes implementar la lógica para el temporizador si es necesario
}


function shuffleArray(array) {
    console.log(array.length);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



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
function finishTest() {
    // Oculta el cuestionario
    document.getElementById("quiz").classList.add("hidden");
    
    // Muestra la sección de resultados
    const results = document.getElementById("results");
    results.innerHTML = generateResults(); // Llama a una función para generar los resultados
    console.log(results);
    results.classList.remove("hidden");
}

function generateResults() {
    // Aquí debes implementar la lógica para calcular los resultados del test
    // Puedes recorrer las preguntas y verificar las respuestas del usuario
    // y compararlas con las respuestas correctas en cada pregunta.

    // Por ejemplo:
    let score = 0;
    for (let i = 0; i < testQuestions.length; i++) {
        const userAnswer = getSelectedAnswer(i); // Implementa esta función para obtener la respuesta seleccionada
        const correctAnswer = testQuestions[i].verdadera;
        console.log(userAnswer);
        console.log(correctAnswer);

        if (userAnswer === correctAnswer) {
            score++;
        }
    }

    // Puedes construir el HTML para mostrar los resultados
    const resultsHTML = `
        <h2>Resultados</h2>
        <p>Puntuación: ${score} de ${testQuestions.length}</p>
        <p>Porcentaje de aciertos: ${(score / testQuestions.length) * 100}%</p>
        <!-- Puedes agregar más información sobre los resultados aquí -->
    `;

    return resultsHTML;
}

function getSelectedAnswer(questionIndex) {
    // Implementa esta función para obtener la respuesta seleccionada por el usuario
    // Debes acceder a los elementos de radio y encontrar cuál de ellos está seleccionado en la pregunta especificada.
    // Puedes utilizar el atributo "name" de los elementos de radio para agrupar las opciones de cada pregunta.
    // Retorna la respuesta seleccionada.
    // Ejemplo:

    const radioButtons = document.getElementsByName(`q${questionIndex}`);
    
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            console.log(parseInt(radioButton.value)+1);
            return parseInt(radioButton.value)+1;
        }
    }
    return null; // Si no se seleccionó ninguna respuesta
}

// Llamar a la función para cargar las opciones del selector de temas al cargar la página
loadThemes();
