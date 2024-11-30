let lectures = []; // Array to store lectures
let students = []; // Array to store students

const gradingScales = {
    "10-point": [
        { grade: "A", min: 90 },
        { grade: "B", min: 80 },
        { grade: "C", min: 70 },
        { grade: "D", min: 60 },
        { grade: "F", min: 0 }
    ],
    "7-point": [
        { grade: "A", min: 93 },
        { grade: "B", min: 85 },
        { grade: "C", min: 77 },
        { grade: "D", min: 70 },
        { grade: "F", min: 0 }
    ]
};

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none'; // Hide all sections
    });
    document.getElementById(sectionId).style.display = 'block'; // Show the selected section
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('default-content');
    updateLectureDropdown();
});

function addLecture(event) {
    event.preventDefault();
    const name = document.getElementById('lecture-name').value;
    const courseId = document.getElementById('course-id').value; // Get the course ID
    const credit = parseInt(document.getElementById('course-credit').value); // Get the credit
    const gradingScaleType = document.getElementById('grading-scale-type').value;

    // Validate inputs
    if (!courseId || !name || isNaN(credit) || credit <= 0) {
        alert('Please provide valid inputs. Credit must be a positive number.');
        return;
    }

    // Check if the course ID already exists
    const isDuplicateCourseId = lectures.some(lecture => lecture.courseId === courseId);
    if (isDuplicateCourseId) {
        alert(`A course with ID "${courseId}" already exists.`);
        return;
    }

    // Add the lecture
    lectures.push({ courseId, name, credit, gradingScaleType });
    alert(`Lecture "${name}" added successfully with Course ID "${courseId}" and ${credit} credits!`);
    document.getElementById('lecture-form').reset();
    updateLectureDropdown();
}

function updateLectureDropdown() {
    const dropdown = document.getElementById('lecture-dropdown');
    dropdown.innerHTML = ''; // Clear previous options

    lectures.forEach(lecture => {
        const option = document.createElement('option');
        option.value = lecture.courseId; // Use the course ID as the value
        option.textContent = `${lecture.name} (ID: ${lecture.courseId}, Credits: ${lecture.credit})`; // Display course details
        dropdown.appendChild(option);
    });
}

function calculateLetterGrade(score, scaleType) {
    const scale = gradingScales[scaleType];
    for (const entry of scale) {
        if (score >= entry.min) {
            return entry.grade;
        }
    }
    return "F"; // Default grade if no match
}

function calculateGPA(studentId) {
    const studentRecords = students.filter(student => student.id === studentId);
    if (studentRecords.length === 0) return 0;

    let totalCredits = 0;
    let weightedGrades = 0;

    studentRecords.forEach(record => {
        const lecture = lectures.find(lec => lec.courseId === record.lecture);
        if (lecture) {
            weightedGrades += parseFloat(record.grade) * lecture.credit;
            totalCredits += lecture.credit;
        }
    });

    return totalCredits > 0 ? (weightedGrades / totalCredits).toFixed(2) : 0;
}



function addStudent(event) {
    event.preventDefault();

    const id = document.getElementById('student-id').value;
    const name = document.getElementById('student-name').value;
    const surname = document.getElementById('student-surname').value;
    const lecture = document.getElementById('lecture-dropdown').value;
    const midterm = parseFloat(document.getElementById('midterm-score').value);
    const final = parseFloat(document.getElementById('final-score').value);

    // Validate inputs
    if (!id || isNaN(midterm) || isNaN(final) || midterm < 0 || final < 0) {
        alert('Please provide valid inputs. Scores must be non-negative.');
        return;
    }

    // Check if the student ID already exists in the same lecture
    const isDuplicateInLecture = students.some(student => student.id === id && student.lecture === lecture);
    if (isDuplicateInLecture) {
        alert(`Student with ID ${id} is already enrolled in the lecture "${lecture}".`);
        return;
    }
    // Check if a student with the same ID already exists
    const isDuplicateId = students.some(student => student.id === id);
    if (isDuplicateId) {
        alert(`A student with ID ${id} already exists. Please check the ID or name.`);
        return;
    }
    // Ensure the selected lecture exists
    const selectedLecture = lectures.find(lec => lec.courseId === lecture);
    if (!selectedLecture) {
        alert('Selected lecture does not exist.');
        return;
    }

    // Calculate grade and letter grade
    const grade = (0.4 * midterm + 0.6 * final).toFixed(2);
    const letterGrade = calculateLetterGrade(grade, selectedLecture.gradingScaleType);

    // Add student to the system
    students.push({
        id,
        name,
        surname,
        lecture,
        midterm,
        final,
        grade,
        letterGrade,
    });

    // Calculate GPA for the student
    const gpa = calculateGPA(id);

    // Show confirmation message
    const confirmation = document.createElement('p');
    confirmation.textContent = `Student "${name} ${surname}" added successfully to "${selectedLecture.name}" with a grade of "${letterGrade}" and GPA of ${gpa}!`;
    confirmation.style.color = 'green';
    document.getElementById('add-student').appendChild(confirmation);

    // Auto-remove confirmation after 5 seconds
    setTimeout(() => confirmation.remove(), 5000);

    // Reset the form
    document.getElementById('student-form').reset();
    displayAllResults(); // Update the results display
}

function displayResults(data) {
    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = ''; // Clear previous content

    if (data.length === 0) {
        resultsTable.innerHTML = '<p>No results found.</p>';
        return;
    }

    // Create the table structure
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Table Header
    const header = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Grade</th>
                <th>Letter Grade</th>
                <th>Actions</th>
            </tr>
        </thead>
    `;
    table.innerHTML = header;

    // Table Body
    const tbody = document.createElement('tbody');
    data.forEach((student) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name} ${student.surname}</td>
            <td>${student.lecture}</td>
            <td>${student.midterm}</td>
            <td>${student.final}</td>
            <td>${student.grade}</td>
            <td>${student.letterGrade}</td>
            <td><button onclick="viewProfile('${student.id}')">View Profile</button></td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    resultsTable.appendChild(table);
}

function sortResults(criteria) {
    let sortedStudents;
    if (criteria === 'gpa') {
        sortedStudents = students.sort((a, b) => {
            return calculateGPA(b.id) - calculateGPA(a.id);
        });
    } else if (criteria === 'grade') {
        sortedStudents = students.sort((a, b) => b.grade - a.grade);
    } else if (criteria === 'name') {
        sortedStudents = students.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayResults(sortedStudents);
}


function viewProfile(studentId) {
    const studentRecords = students.filter((student) => student.id === studentId);

    if (studentRecords.length === 0) {
        alert('No profile found for this student.');
        return;
    }

    // Calculate weighted GPA
    const overallGPA = calculateGPA(studentId);

    // Generate profile content
    const profileSection = document.getElementById('results-table');
    profileSection.innerHTML = `
        <h3>Student Profile</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>Lecture</th>
                    <th>Credits</th>
                    <th>Midterm</th>
                    <th>Final</th>
                    <th>Grade</th>
                    <th>Letter Grade</th>
                </tr>
            </thead>
            <tbody>
                ${studentRecords
                    .map((record) => {
                        const lecture = lectures.find((lec) => lec.courseId === record.lecture);
                        return `
                            <tr>
                                <td>${lecture.name}</td>
                                <td>${lecture.credit}</td>
                                <td>${record.midterm}</td>
                                <td>${record.final}</td>
                                <td>${record.grade}</td>
                                <td>${record.letterGrade}</td>
                            </tr>
                        `;
                    })
                    .join('')}
            </tbody>
        </table>
        <p><strong>Overall GPA:</strong> ${overallGPA}</p>
        <button class="content-button" onclick="displayAllResults()">Back to Results</button>
    `;
}

function displayAllResults() {
    displayResults(students);
}

function filterResults(criteria) {
    const filtered = students.filter(student => 
        criteria === 'passed' ? student.grade >= 60 : student.grade < 60
    );
    displayResults(filtered);
}

function searchStudent() {
    const searchQuery = document.getElementById('search-student').value.toLowerCase();

    if (!searchQuery) {
        displayResults(students); // If search query is empty, display all students
        return;
    }

    const results = students.filter(student => {
        const fullName = `${student.name} ${student.surname}`.toLowerCase();
        return (
            student.id.toLowerCase().includes(searchQuery) || // Search by ID
            student.name.toLowerCase().includes(searchQuery) || // Search by name
            student.surname.toLowerCase().includes(searchQuery) || // Search by surname
            fullName.includes(searchQuery) // Search by full name (name + surname)
        );
    });

    displayResults(results);
}
