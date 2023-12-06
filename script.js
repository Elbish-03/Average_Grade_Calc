const subBtn = document.getElementById("submit-btn");
const addBtn = document.getElementById("addBtn");
const mainForm = document.querySelector(".calculator");
const allbutton = document.querySelector("#all-sub");
const textToShow = document.querySelector(".textToShow");

subBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const grade = document.getElementById("grade").value;
  const subject = document.getElementById("subject").value;
  textToShow.style.visibility = "visible";
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grade, subject }),
  });
});

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const form = document.createElement("form");

  // Create the input elements

  const input2 = document.createElement("input");
  input2.setAttribute("type", "number");
  input2.setAttribute("placeholder", "4,5");

  form.appendChild(input2);

  mainForm.appendChild(form);
});

// allbutton.addEventListener("click", (e) => {
//   e.preventDefault();
//   alert("You have clicked All button");
//   const grade = document.getElementById("grade").value;
//   const subject = document.getElementById("subject").value;

//   fetch("/show-data", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ grade, subject }),
//   });
// });
