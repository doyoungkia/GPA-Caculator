// 사용자 계정별 데이터 관리
function getCurrentUser(showAlert = true) {
    const username = localStorage.getItem("currentUser");
    if (!username && showAlert) {
        alert("No user is logged in.");
        window.location.href = "login.html";
    }
    return username;
}

function loadUserData() {
    const username = getCurrentUser(false); // 경고 메시지 비활성화
    if (!username) return [];

    const userDataKey = `${username}_data`;
    return JSON.parse(localStorage.getItem(userDataKey)) || [];
}


function saveUserData(data) {
    const username = getCurrentUser();
    if (!username) return;

    const userDataKey = `${username}_data`;
    localStorage.setItem(userDataKey, JSON.stringify(data));
}

// 과목 데이터 관리
let subjects = loadUserData();
let formativeWeight = 20;
let summativeWeight = 80;

// Save Data (호환성 유지)
function saveData() {
    saveUserData(subjects);
}

// Load Data on Page Load
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("index.html")) {
        renderSubjects();
        calculateGPA();
    } else if (window.location.pathname.includes("subject.html")) {
        renderSubjectDetails();
    }
});

// Navigate Back to Home
function goHome() {
    saveData();
    window.location.href = "index.html";
}

// Add a New Subject
function addSubject() {
    const newSubject = { name: "New Subject", assessments: [] };
    subjects.push(newSubject);
    saveData();
    renderSubjects();
    calculateGPA();
}

// Render All Subjects
function renderSubjects() {
    const subjectsDiv = document.getElementById("subjects");
    subjectsDiv.innerHTML = '';

    subjects.forEach((subject, index) => {
        const finalGrade = calculateFinalGrade(subject);

        subjectsDiv.innerHTML += `
            <div class="subject">
                <div id="subject-name-${index}">
                    ${subject.name}
                    <button class="small-btn" onclick="editSubjectName(${index})">Edit</button>
                </div>
                <div>Final Grade: ${finalGrade}</div>
                <button class="btn save-btn" onclick="openSubject(${index})">Details</button>
                <button class="btn small-btn" onclick="deleteSubject(${index})">Delete</button>
            </div>
        `;
    });
}


// Edit Subject Name
function editSubjectName(index) {
    const subjectDiv = document.getElementById(`subject-name-${index}`);
    subjectDiv.innerHTML = `
        <input type="text" id="edit-name-${index}" value="${subjects[index].name}" />
        <button class="btn small-btn" onclick="saveSubjectName(${index})">Save</button>
    `;
}

// Save Edited Subject Name
function saveSubjectName(index) {
    const newName = document.getElementById(`edit-name-${index}`).value.trim();
    if (newName) {
        subjects[index].name = newName;
        saveData();
        renderSubjects();
    } else {
        alert("Name cannot be empty!");
    }
}

// Delete Subject
function deleteSubject(index) {
    subjects.splice(index, 1);
    saveData();
    renderSubjects();
    calculateGPA();
}

// Open Subject Details
function openSubject(index) {
    localStorage.setItem("currentSubject", index);
    window.location.href = "subject.html";
}

// Render Subject Details
function renderSubjectDetails() {
    const currentSubjectIndex = localStorage.getItem("currentSubject");
    const subject = subjects[currentSubjectIndex];
    if (!subject) return goHome();

    document.getElementById("subjectName").innerText = subject.name;

    const finalGrade = calculateFinalGrade(subject);
    document.getElementById("finalGrade").innerText = `Final Grade: ${finalGrade}`;

    renderAssessments();
}



// Add Assessment
function addAssessment() {
    const currentSubjectIndex = localStorage.getItem("currentSubject");
    const subject = subjects[currentSubjectIndex];

    const newAssessment = { type: "Formative", grade: "A", score: 10 };
    subject.assessments.push(newAssessment);

    saveData();
    renderAssessments();
}

// Convert Letter Grade to Numeric Score
function convertGradeToNumeric(grade) {
    const gradeMapping = {
        "A": 10,
        "A-": 9,
        "B+": 8,
        "B": 7,
        "B-": 6,
        "C+": 5,
        "C": 4,
        "C-": 3,
        "D+": 2,
        "D": 1,
        "F": 0,
    };
    return gradeMapping[grade] || 0;
}

// Convert Average Numeric Score to Final Grade
function convertNumericToGrade(average) {
    if (average >= 9.45) return "A";
    if (average >= 9.00) return "A-";
    if (average >= 8.00) return "B+";
    if (average >= 7.00) return "B";
    if (average >= 6.00) return "B-";
    if (average >= 5.00) return "C+";
    if (average >= 4.00) return "C";
    if (average >= 3.00) return "C-";
    if (average >= 2.00) return "D+";
    if (average >= 1.00) return "D";
    return "F";
}

// Render Assessments with Calculation Details
function renderAssessments() {
    const currentSubjectIndex = localStorage.getItem("currentSubject");
    const subject = subjects[currentSubjectIndex];
    const assessmentsDiv = document.getElementById("assessments");

    // Clear existing content
    assessmentsDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Type</th>
                    <th>Grade</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="assessmentTableBody"></tbody>
        </table>
    `;

    const tableBody = document.getElementById("assessmentTableBody");

    subject.assessments.forEach((assessment, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <select onchange="updateAssessmentType(${index}, this.value)">
                        <option value="Formative" ${assessment.type === "Formative" ? "selected" : ""}>Formative</option>
                        <option value="Summative" ${assessment.type === "Summative" ? "selected" : ""}>Summative</option>
                    </select>
                </td>
                <td>
                    <select onchange="updateAssessmentGrade(${index}, this.value)">
                        <option value="A" ${assessment.grade === "A" ? "selected" : ""}>A</option>
                        <option value="A-" ${assessment.grade === "A-" ? "selected" : ""}>A-</option>
                        <option value="B+" ${assessment.grade === "B+" ? "selected" : ""}>B+</option>
                        <option value="B" ${assessment.grade === "B" ? "selected" : ""}>B</option>
                        <option value="B-" ${assessment.grade === "B-" ? "selected" : ""}>B-</option>
                        <option value="C+" ${assessment.grade === "C+" ? "selected" : ""}>C+</option>
                        <option value="C" ${assessment.grade === "C" ? "selected" : ""}>C</option>
                        <option value="C-" ${assessment.grade === "C-" ? "selected" : ""}>C-</option>
                        <option value="D+" ${assessment.grade === "D+" ? "selected" : ""}>D+</option>
                        <option value="D" ${assessment.grade === "D" ? "selected" : ""}>D</option>
                        <option value="F" ${assessment.grade === "F" ? "selected" : ""}>F</option>
                    </select>
                </td>
                <td>
                    <button class="btn small-btn" onclick="deleteAssessment(${index})">Delete</button>
                </td>
            </tr>
        `;
    });

    // Add Assessment 버튼 추가
    const addButton = document.createElement("button");
    addButton.id = "add-assessment-button";
    addButton.className = "btn add-btn";
    addButton.innerText = "+ Add Assessment";
    addButton.onclick = addAssessment;
    assessmentsDiv.appendChild(addButton);
}





// 회원가입
function signup() {
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username]) {
        alert("Username already exists.");
        return;
    }

    users[username] = { password: btoa(password) }; // 비밀번호는 암호화해서 저장
    localStorage.setItem("users", JSON.stringify(users));

    // 사용자 데이터를 초기화
    localStorage.setItem(`${username}_data`, JSON.stringify([]));
    alert("Sign up successful! You can now log in.");
    window.location.href = "login.html";
}

// 로그인
function login() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (!users[username]) {
        alert("User not found.");
        return;
    }

    if (users[username].password !== btoa(password)) {
        alert("Incorrect password.");
        return;
    }

    localStorage.setItem("currentUser", username);
    alert("Login successful!");
    window.location.href = "index.html";
}

// 로그아웃
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function renderSignup() {
    const appDiv = document.getElementById("app");
    if (!appDiv) {
        console.error("App container not found!");
        return;
    }

    appDiv.innerHTML = `
        <div class="container">
            <h1>Sign Up</h1>
            <input type="text" id="signup-username" placeholder="Enter Username" required>
            <input type="password" id="signup-password" placeholder="Enter Password" required>
            <button onclick="signup()">Sign Up</button>
            <p>Already have an account? <a href="#" onclick="renderLogin()">Login</a></p>
        </div>
    `;
}

if (document.getElementById("app")) {
    renderLogin();
}

// 로그인 화면 렌더링
function renderLogin() {
    const appDiv = document.getElementById("app");
    if (!appDiv) {
        console.error("App container not found!");
        return;
    }

    appDiv.innerHTML = `
        <div class="container">
            <h1>Login</h1>
            <input type="text" id="login-username" placeholder="Enter Username" required>
            <input type="password" id="login-password" placeholder="Enter Password" required>
            <button onclick="login()">Login</button>
            <p>Don't have an account? <a href="#" onclick="renderSignup()">Sign up</a></p>
        </div>
    `;
}

// 로그인 여부 확인
function isLoggedIn() {
    return localStorage.getItem("currentUser") !== null;
}

function updateWeights() {
    const formativeInput = document.getElementById("formativeWeight");
    const summativeInput = document.getElementById("summativeWeight");

    const newFormativeWeight = parseInt(formativeInput.value, 10);
    const newSummativeWeight = parseInt(summativeInput.value, 10);

    if (newFormativeWeight + newSummativeWeight !== 100) {
        alert("Formative and Summative weights must add up to 100%");
        return;
    }

    formativeWeight = newFormativeWeight;
    summativeWeight = newSummativeWeight;

    alert("Weights updated successfully!");
}

function calculateFinalGrade(subject) {
    if (!subject || !subject.assessments || subject.assessments.length === 0) {
        return "N/A";
    }

    let totalCal = 0;
    let totalSum = 0;

    subject.assessments.forEach(assessment => {
        const numericScore = convertGradeToNumeric(assessment.grade);
        const weight = assessment.type === "Formative" ? formativeWeight / 100 : summativeWeight / 100;
        totalCal += numericScore * weight;
        totalSum += weight;
    });

    if (totalSum === 0) return "N/A";

    const average = totalCal / totalSum;
    return convertNumericToGrade(average);
}

function deleteAssessment(index) {
    const currentSubjectIndex = localStorage.getItem("currentSubject");
    const subject = subjects[currentSubjectIndex];

    if (!subject || !subject.assessments) return;

    // 선택된 Assessment 삭제
    subject.assessments.splice(index, 1);
    saveData();
    renderAssessments(); // 업데이트된 리스트 렌더링
}

function calculateGPA() {
    let totalGPA = 0;
    let subjectCount = 0;

    subjects.forEach(subject => {
        const finalGrade = calculateFinalGrade(subject);
        if (finalGrade !== "N/A") {
            const gpa = convertGradeToGPA(finalGrade);
            totalGPA += gpa;
            subjectCount++;
        }
    });

    const averageGPA = (totalGPA / subjectCount || 0).toFixed(2);
    const gpaDisplay = document.getElementById("gpa");
    if (gpaDisplay) {
        gpaDisplay.innerText = `GPA: ${averageGPA}`;
    }
}



function updateAssessmentType(index, type) {
    const currentSubjectIndex = localStorage.getItem("currentSubject");
    const subject = subjects[currentSubjectIndex];

    if (subject && subject.assessments[index]) {
        subject.assessments[index].type = type;
        saveData();
        renderAssessments();
    }
}

function updateAssessmentGrade(index, grade) {
    const currentSubjectIndex = localStorage.getItem("currentSubject");
    const subject = subjects[currentSubjectIndex];

    if (subject && subject.assessments[index]) {
        subject.assessments[index].grade = grade;
        saveData();
        renderAssessments();
    }
}

function convertGradeToGPA(grade) {
    const gradeMapping = {
        "A": 4.0,
        "A-": 3.7,
        "B+": 3.3,
        "B": 3.0,
        "B-": 2.7,
        "C+": 2.3,
        "C": 2.0,
        "C-": 1.7,
        "D+": 1.3,
        "D": 1.0,
        "F": 0.0,
    };
    return gradeMapping[grade] || 0.0;
}