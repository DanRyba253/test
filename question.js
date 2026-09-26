questions = store.get("questions")
current_question_idx = store.get("current_question_idx")
current_question = questions[current_question_idx]

question_idx_elem = document.getElementById("question_idx")
question_idx_elem.innerHTML = current_question_idx.toString()

question_description_elem = document.getElementById("question_description")
question_description_elem.innerHTML = current_question.description

question_panel = document.getElementById("question-panel")

back_button = document.getElementById("back-button")
forward_button = document.getElementById("forward-button")

key_positions = {}
dragged_element = null
dragging_element = false
initial_mouse_x = 0
initial_mouse_y = 0
z_index = 0

if (current_question_idx == 0) {
    back_button.disabled = true
}

back_button.addEventListener('click', () => {
        store.set("current_question_idx", current_question_idx - 1)
        window.location.reload()
})

if (!current_question.answered) {
    forward_button.disabled = true
}

if (current_question_idx == questions.length - 1) {
    forward_button.innerHTML = "$ результаты"
    forward_button.className = "mauve-button"
    forward_button.addEventListener('click', () => {
        window.location.href = "results.html"
    })
} else {
    forward_button.addEventListener('click', () => {
        store.set("current_question_idx", current_question_idx + 1)
        window.location.reload()
    })
}

if (current_question.type == "single-choice") {
    for (const [i, variant] of current_question.variants.entries()) {
        variant_elem = document.createElement("label")
        
        input_elem = document.createElement("input")
        input_elem.type = "radio"
        input_elem.name = "single-choice-radio"
        input_elem.value = i
        if (current_question.answered && current_question.answer == i) {
            input_elem.checked = true
        }
        
        mark_elem = document.createElement("span")
        mark_elem.className = "single-choice-radio-mark"
        mark_elem.innerHTML = "(<span>*</span>)"

        label_elem = document.createElement("span")
        label_elem.innerHTML = variant

        variant_elem.append(input_elem, mark_elem, label_elem)
        question_panel.append(variant_elem)
    }

    const radios = document.querySelectorAll('input[name="single-choice-radio"]')

    radios.forEach(radio => {
        radio.addEventListener("change", function() {
            if (this.checked) {
                current_question.answered = true
                current_question.answer = this.value
                questions[current_question_idx] = current_question
                store.set("questions", questions)
                forward_button.disabled = false
            }
        })
    })
} else if (current_question.type == "multiple-choice") {
    for (const [i, variant] of current_question.variants.entries()) {
        variant_elem = document.createElement("label")
        
        input_elem = document.createElement("input")
        input_elem.type = "checkbox"
        input_elem.name = "multiple-choice-checkbox"
        input_elem.value = i
        if (current_question.answered && i in current_question.answer) {
            input_elem.checked = true
        }
        
        mark_elem = document.createElement("span")
        mark_elem.className = "multiple-choice-checkbox-mark"
        mark_elem.innerHTML = "[<span>✔</span>]"

        label_elem = document.createElement("span")
        label_elem.innerHTML = variant

        variant_elem.append(input_elem, mark_elem, label_elem)
        question_panel.append(variant_elem)
    }
    
    const checkboxes = document.querySelectorAll('input[name="multiple-choice-checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            if (this.checked) {
                current_question.answer.push(this.value)
            } else {
                value_index = current_question.answer.indexOf(this.value)
                current_question.answer.splice(value_index, 1)
            }
            questions[current_question_idx] = current_question
            store.set("questions", questions)
        })
    })
} else if (current_question.type == "open") {
    label_elem = document.createElement("label")
    label_elem.className = "text"

    input_start = document.createElement("span")
    input_start.innerHTML = '<span class="mauve">var</span> ответ = <span class="green">"</span>'

    input_field = document.createElement("input")
    input_field.type = "text"
    if (current_question.answered) {
        input_field.value = current_question.answer
    }

    input_field.addEventListener('input', function() {
        if (this.value.length == 0) {
            current_question.answered = false
            forward_button.disabled = true
        } else {
            current_question.answered = true
            current_question.answer = this.value
            forward_button.disabled = false
        }
        questions[current_question_idx] = current_question
        store.set("questions", questions)
    })

    input_end = document.createElement("span")
    input_end.innerHTML = '<span class="green">"</span>;'

    label_elem.append(input_start, input_field, input_end)
    question_panel.append(label_elem)
} else if (current_question.type == "pairs") {
    object_start = document.createElement("span")
    object_start.innerHTML = '<span class="mauve">var</span> <span class="text">ответ =</span> <span class="blue">{</span>'
    question_panel.append(object_start, document.createElement("br"))
    for (const [key, value] of Object.entries(current_question.answer)) {
        key_span = document.createElement("span")
        key_span.className = "green indent"
        key_span.innerHTML = '"' + key + '"'
        
        colon_span = document.createElement("span")
        colon_span.className = "text colon"
        colon_span.innerHTML = ":"

        value_span = document.createElement("span")
        value_span.className = "green"
        value_span.innerHTML = '"' + value + '"'

        comma_span = document.createElement("span")
        comma_span.className = "text"
        comma_span.innerHTML = ","

        value_div = document.createElement("div")
        value_div.className = "value-container"
        value_div.append(value_span, comma_span)

        question_panel.append(key_span, colon_span, value_div, document.createElement("br"))

        value_pos = getAbsolutePosition(value_div)
        key_positions[key] = value_pos

        value_float = value_div.cloneNode(true)
        value_float.className = "value-float"
        value_float.setAttribute("key", key)
        value_float.style.left = value_pos.left.toString() + "px"
        value_float.style.top = value_pos.top.toString() + "px"
        value_float.style.zIndex = z_index.toString()
        value_float.addEventListener('mousedown', function(ev) {
            dragging_element = true
            dragged_element = this
            initial_mouse_x = ev.clientX
            initial_mouse_y = ev.clientY
            z_index += 1
            this.style.zIndex = z_index.toString()
            this.classList.add("dragged")
            window.addEventListener('mousemove', onDrag) 
        })
        value_float.addEventListener('mouseenter', function() {
            if (!dragging_element) {
                return
            }

            my_key = this.getAttribute("key")
            dragged_key = dragged_element.getAttribute("key")
            this.setAttribute("key", dragged_key)
            dragged_element.setAttribute("key", my_key)
            
            dragged_pos = key_positions[dragged_key]
            this.style.top = dragged_pos.top.toString() + "px"
            this.style.left = dragged_pos.left.toString() + "px"

            my_pos = key_positions[my_key]
            dragged_element.style.top = my_pos.top.toString() + "px"
            dragged_element.style.left = my_pos.left.toString() + "px"

            dy = my_pos.top - dragged_pos.top
            initial_mouse_y += dy

            dx = my_pos.left - dragged_pos.left
            initial_mouse_x += dx

            my_answer = current_question.answer[my_key]
            dragged_answer = current_question.answer[dragged_key]
            current_question.answer[my_key] = dragged_answer
            current_question.answer[dragged_key] = my_answer

            questions[current_question_idx] = current_question
            store.set("questions", questions)
        })
        question_panel.append(value_float)
    }
    object_end = document.createElement("span")
    object_end.className = "text"
    object_end.innerHTML = '<span class="blue">}</span>;'
    question_panel.append(object_end)
}

function getAbsolutePosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}


window.addEventListener('mouseup', function() {
    if (dragging_element == false) {
        return
    }
    window.removeEventListener('mousemove', onDrag)
    dragging_element = false
    key_pos = key_positions[dragged_element.getAttribute("key")]
    dragged_element.classList.remove("dragged")
    dragged_element.style.transform = ""
    dragged_element = null
})

function onDrag(ev) {
    if (dragging_element) {
        dx = ev.clientX - initial_mouse_x
        dy = ev.clientY - initial_mouse_y
        dragged_element.style.transform = `translate(${dx}px, ${dy}px)`
    }
}
