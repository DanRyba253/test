again_button = document.getElementById("again-button")
again_button.addEventListener('click', () => {
    window.location.href = "index.html"
})

questions = store.get("questions")

question_count = questions.length
corrent_count = 0

for (question of questions) {
    if (question.type == "single-choice") {
        if (question.answer == question.correct_answer) {
            corrent_count += 1
        }
    } else if (question.type == "multiple-choice") {
        answer = question.answer.toSorted((a, b) => a - b)
        if (
            answer.length == question.correct_answer.length &&
            answer.every((val, index) => val == question.correct_answer[index])
        ) {
            corrent_count += 1
        }
    } else if (question.type == "open") {
        if (question.correct_answer.includes(question.answer)) {
            corrent_count += 1
        }
    } else if (question.type == "pairs") {
        correct = true
        for (key in question.corrent_answer) {
            if (question.answer[key] != question.correct_answer[key]) {
                correct = false
                break
            }
        }
        if (correct) {
            corrent_count += 1
        }
    }
}
incorrect_count = question_count - corrent_count

chart = document.getElementById("pie-chart")
percent_correct_end = corrent_count * 100 / question_count
chart.style.setProperty("--percent-correct-end", percent_correct_end.toString() + "%")
chart.style.setProperty("--percent-incorrect-end", "100%")

correct_count_span = document.getElementById("correct-count")
correct_count_span.innerHTML = `${corrent_count}/${question_count}`

incorrect_count_span = document.getElementById("incorrect-count")
incorrect_count_span.innerHTML = `${incorrect_count}/${question_count}`

results = document.getElementById("full-results")

for (i in questions) {
    question = questions[i]
    header = document.createElement("h2")
    header.innerHTML = `> programming_languages.test.questions[${i}]`
    subheader = document.createElement("span")
    subheader.className = "comment"
    subheader.innerHTML = `// ${question.description}`
    
    panel = document.createElement("div")
    panel.className = "panel"

    if (question.type == "single-choice") {
        for (i in question.variants) {
            variant_class = "text"
            variant_mark = " "
            if (i == parseInt(question.answer, 10)) {
                variant_mark = "*"
                variant_class = "red"
            }
            if (i == question.correct_answer) {
                variant_class = "green"
            }
            variant = question.variants[i]
            variant_span = document.createElement("span")
            variant_span.className = variant_class
            variant_span.innerHTML = `(${variant_mark}) ${variant}`
            panel.append(variant_span, document.createElement("br"))
        }
    } else if (question.type == "multiple-choice") {
        for (i in question.variants) {
            variant_class = "text"
            variant_mark = " "
            checked = false
            if (question.answer.includes(i)) {
                variant_mark = "✔"
                checked = true
            }
            if (checked == question.correct_answer.includes(parseInt(i, 10))) {
                if (checked) {
                    variant_class = "green"
                }
            } else {
                variant_class = "red"
            }
            variant = question.variants[i]
            variant_span = document.createElement("span")
            variant_span.className = variant_class
            variant_span.innerHTML = `[${variant_mark}] ${variant}`
            panel.append(variant_span, document.createElement("br"))
        }
    } else if (question.type == "open") {
        answer_class = "red"
        if (question.correct_answer.includes(question.answer)) {
            answer_class = "green"
        }
        answer_span = document.createElement("span")
        answer_span.className = "text"
        answer_span.innerHTML = `<span class="mauve">var</span> ответ = <span class="${answer_class}">"${question.answer}"</span>;`
        panel.append(answer_span, document.createElement("br"), document.createElement("br"))

        if (question.correct_answer.length == 1) {
            correct_answer_span = document.createElement("span")
            correct_answer_span.className = "text"
            correct_answer_span.innerHTML = `<span class="mauve">var</span> правильный_ответ = <span class="${answer_class}">"${question.correct_answer[0]}"</span>;`
            panel.append(correct_answer_span, document.createElement("br"))
        } else {
            correct_answer_start = document.createElement("span")
            correct_answer_start.className = "text"
            correct_answer_start.innerHTML = '<span class="mauve">var</span> правильные_ответы = <span class="blue">[</span>'
            panel.append(correct_answer_start, document.createElement("br"))
            for (correct of question.correct_answer) {
                correct_span = document.createElement("span")
                correct_span.className = "text indent"
                correct_span.innerHTML = `<span class="green">"${correct}"</span>,`
                panel.append(correct_span, document.createElement("br"))
            }
            correct_answer_end = document.createElement("span")
            correct_answer_end.className = "text"
            correct_answer_end.innerHTML = '<span class="blue">]</span>;'
            panel.append(correct_answer_end, document.createElement("br"))
        }
    } else if (question.type == "pairs") {
        object_start = document.createElement("span")
        object_start.innerHTML = '<span class="mauve">var</span> <span class="text">ответ =</span> <span class="blue">{</span>'
        panel.append(object_start, document.createElement("br"))
        for (const [key, value] of Object.entries(question.answer)) {
            answer_class = "red"
            if (question.correct_answer[key] == value) {
                answer_class = "green"
            }
            row_elem = document.createElement("span")
            row_elem.className = "text indent"
            row_elem.innerHTML = `<span class="green">"${key}"</span>: <span class="${answer_class}">"${value}"</span>,`
            panel.append(row_elem, document.createElement("br"))
        }
        object_end = document.createElement("span")
        object_end.className = "text"
        object_end.innerHTML = '<span class="blue">}</span>;'
        panel.append(object_end, document.createElement("br"), document.createElement("br"))

        object_start = document.createElement("span")
        object_start.innerHTML = '<span class="mauve">var</span> <span class="text">правильный_ответ =</span> <span class="blue">{</span>'
        panel.append(object_start, document.createElement("br"))
        for (const [key, value] of Object.entries(question.correct_answer)) {
            row_elem = document.createElement("span")
            row_elem.className = "text indent"
            row_elem.innerHTML = `<span class="green">"${key}"</span>: <span class="green">"${value}"</span>,`
            panel.append(row_elem, document.createElement("br"))
        }
        object_end = document.createElement("span")
        object_end.className = "text"
        object_end.innerHTML = '<span class="blue">}</span>;'
        panel.append(object_end, document.createElement("br"))
    }

    comment_start = document.createElement("span")
    comment_start.className = "comment"
    comment_start.innerHTML = "/*"
    
    info_div = document.createElement("div")
    info_div.className = "info-div"

    info_span = document.createElement("span")
    info_span.className = "comment"
    info_span.innerHTML = question.info
    info_div.append(info_span)

    comment_end = document.createElement("span")
    comment_end.className = "comment"
    comment_end.innerHTML = "*/"

    panel.append(document.createElement("br"), comment_start, info_div, comment_end)

    results.append(document.createElement("hr"), header, subheader, panel)
}


