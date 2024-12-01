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
    updateLectureResultsDropdown(); // Update the search dropdown when the page loads

});

function addLecture(event) {
    event.preventDefault();
    const name = document.getElementById('lecture-name').value;
    const courseId = document.getElementById('course-id').value; // Get the course ID
    const credit = parseInt(document.getElementById('course-credit').value); // Get the credit
    const gradingScaleType = document.getElementById('grading-scale-type').value;

    // Check if courseId or name is not provided, or if credit is not a number or less than or equal to 0
    if (!courseId || !name || isNaN(credit) || credit <= 0) {
        // If any of the conditions are true, show an alert message to the user
        alert('Please provide valid inputs. Credit must be a positive number.');
        // Exit the function early to prevent further execution
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
    updateLectureResultsDropdown();
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
function updateLectureResultsDropdown() {
    const resultsDropdown = document.getElementById('lecture-search');
    resultsDropdown.innerHTML = ''; // Clear previous options

    lectures.forEach(lecture => {
        const option = document.createElement('option');
        option.value = lecture.courseId; // Use the course ID as the value
        option.textContent = `${lecture.name} (ID: ${lecture.courseId})`; // Display course details
        resultsDropdown.appendChild(option);
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

// Map letter grades to GPA scale (4.0 scale)
const letterGradeToGPA = {
    "A": 4.0,
    "B": 3.0,
    "C": 2.0,
    "D": 1.0,
    "F": 0.0
};

function calculateGPA(studentId) {
    const studentRecords = students.filter(student => student.id === studentId);
    if (studentRecords.length === 0) return 0;

    let totalCredits = 0;
    let weightedGPA = 0;

    studentRecords.forEach(record => {
        const lecture = lectures.find(lec => lec.courseId === record.lecture);
        if (lecture) {
            // Get the GPA value based on the letter grade
            const letterGPA = letterGradeToGPA[record.letterGrade];
            weightedGPA += letterGPA * lecture.credit;
            totalCredits += lecture.credit;
        }
    });

    return totalCredits > 0 ? (weightedGPA / totalCredits).toFixed(2) : 0;
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
    if (!id || isNaN(midterm) || isNaN(final) || midterm < 0 || midterm > 100 || final < 0 || final > 100) {
        alert('Please provide valid inputs. Midterm and Final scores must be between 0 and 100.');
        return;
    }
    // Check if the student is already enrolled in the same lecture
    const isDuplicateInLecture = students.some(student => student.id === id && student.lecture === lecture);
    if (isDuplicateInLecture) {
        alert(`Student with ID ${id} is already enrolled in the lecture "${lecture}".`);
        return;
    }

    // Ensure the selected lecture exists
    const selectedLecture = lectures.find(lec => lec.courseId === lecture);
    if (!selectedLecture) {
        alert('Selected lecture does not exist.');
        return;
    }

    // Check if the student ID already exists (but allow enrollment in other courses)
    const existingStudent = students.find(student => student.id === id);
    if (existingStudent) {
        // If the student is already enrolled in another course, add them to the new course
        const grade = (0.4 * midterm + 0.6 * final).toFixed(2);
        const letterGrade = calculateLetterGrade(grade, selectedLecture.gradingScaleType);

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

        alert(`Student with ID ${id} has been enrolled in the new lecture "${selectedLecture.name}".`);
    } else {
        // If the student is not yet enrolled in any course, add the student to the system with the selected course
        const grade = (0.4 * midterm + 0.6 * final).toFixed(2);
        const letterGrade = calculateLetterGrade(grade, selectedLecture.gradingScaleType);

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

        alert(`Student "${name} ${surname}" added successfully to "${selectedLecture.name}" with a grade of "${letterGrade}".`);
    }

    // Reset the form
    document.getElementById('student-form').reset();
    displayAllResults(); // Update the results display
}

function deleteStudent(studentId) {
    // Confirm before deletion
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
        // Find and remove the student
        students = students.filter(student => student.id !== studentId);

        // Refresh the results table
        displayAllResults();
    }
}
function updateStudent(studentId) {
    // Get the updated data from the form
    const id = document.getElementById('student-id').value;
    const name = document.getElementById('student-name').value;
    const surname = document.getElementById('student-surname').value;
    const lecture = document.getElementById('lecture-dropdown').value;
    const midterm = parseFloat(document.getElementById('midterm-score').value);
    const final = parseFloat(document.getElementById('final-score').value);

    // Validate the inputs
    if (!id || isNaN(midterm) || isNaN(final) || midterm < 0 || final < 0) {
        alert('Please provide valid inputs. Scores must be non-negative.');
        return;
    }

    // Find the student in the array and update their details
    const studentIndex = students.findIndex(student => student.id === studentId);

    if (studentIndex !== -1) {
        // Calculate the grade and letter grade
        const grade = (0.4 * midterm + 0.6 * final).toFixed(2);
        const selectedLecture = lectures.find(lec => lec.courseId === lecture);
        const letterGrade = calculateLetterGrade(grade, selectedLecture.gradingScaleType);

        // Update the student data
        students[studentIndex] = {
            id,
            name,
            surname,
            lecture,
            midterm,
            final,
            grade,
            letterGrade
        };

        // Show confirmation alert
        alert(`Student ${name} ${surname} has been updated successfully!`);
        document.getElementById('student-form').reset(); // Reset the form
        displayAllResults(); // Refresh the results display
    } else {
        alert('Student not found.');
    }

    // Reset the submit button text back to "Add Student"
    const submitButton = document.querySelector('#student-form button[type="submit"]');
    submitButton.textContent = "Add Student";  // Reset the button text
}



function editStudent(studentId) {
    // Find the student based on ID
    const student = students.find(student => student.id === studentId);

    if (student) {
        // Populate the form with the student's current data
        document.getElementById('student-id').value = student.id;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-surname').value = student.surname;
        document.getElementById('lecture-dropdown').value = student.lecture;
        document.getElementById('midterm-score').value = student.midterm;
        document.getElementById('final-score').value = student.final;

        // Change the submit button text to "Update Student"
        const submitButton = document.querySelector('#student-form button[type="submit"]');
        submitButton.textContent = "Update Student";  // Change button text

        // Update the form submission handler to call the updateStudent function
        // Ensure we reset the onsubmit before assigning the new function to prevent multiple handlers
        document.getElementById('student-form').onsubmit = function(event) {
            event.preventDefault();  // Prevent default form submission

            // Call updateStudent with the studentId and updated data
            updateStudent(studentId);
        };
    }
}



function displayResults(data) {
    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = ''; // Clear previous content

    if (data.length === 0) {
        resultsTable.innerHTML = '<p>No results found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Lecture</th>
                <th>Midterm</th>
                <th>Final</th>
                <th>Grade</th>
                <th>Letter Grade</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(student => `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name} ${student.surname}</td>
                    <td>${lectures.find(lec => lec.courseId === student.lecture).name}</td>
                    <td>${student.midterm}</td>
                    <td>${student.final}</td>
                    <td>${student.grade}</td>
                    <td>${student.letterGrade}</td>
                    <td>
                        <button class="view-profile-btn" data-id="${student.id}">View Profile</button>
                        <button class="delete-btn" data-id="${student.id}">Delete</button>
                        <button class="edit-btn" data-id="${student.id}">Edit</button> <!-- Edit button -->
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    resultsTable.appendChild(table);

    // Event delegation for dynamically created buttons
    resultsTable.addEventListener('click', function(event) {
        const studentId = event.target.dataset.id;
        
        if (event.target.classList.contains('edit-btn')) {
            editStudent(studentId); // Call editStudent when Edit button is clicked
        } else if (event.target.classList.contains('delete-btn')) {
            deleteStudent(studentId); // Call deleteStudent when Delete button is clicked
        } else if (event.target.classList.contains('view-profile-btn')) {
            viewProfile(studentId); // Call viewProfile when View Profile button is clicked
        }
    });
}



function searchResults() {
    const lectureSearch = document.getElementById('lecture-search').value.toLowerCase();
    const studentIdSearch = document.getElementById('search-student-id').value.toLowerCase();
    const studentNameSearch = document.getElementById('search-student-name').value.toLowerCase();

    let filteredResults = students;

    // Filter by lecture if selected
    if (lectureSearch) {
        filteredResults = filteredResults.filter(student => 
            student.lecture.toLowerCase().includes(lectureSearch)
        );
    }

    // Filter by student ID
    if (studentIdSearch) {
        filteredResults = filteredResults.filter(student => 
            student.id.toLowerCase().includes(studentIdSearch)
        );
    }

    // Filter by student name (first or last name)
    if (studentNameSearch) {
        filteredResults = filteredResults.filter(student => {
            const fullName = `${student.name} ${student.surname}`.toLowerCase();
            return fullName.includes(studentNameSearch);
        });
    }

    // Display filtered results
    displayResults(filteredResults);
}

function viewLectureDetails(lectureId) {
    if (!lectureId) {
        alert('Please select a lecture.');
        return;
    }

    // Filter the students enrolled in the selected lecture
    const studentsInLecture = students.filter(student => student.lecture === lectureId);

    if (studentsInLecture.length === 0) {
        alert('No students in this lecture.');
        return;
    }

    const totalStudents = studentsInLecture.length;
    const passedStudents = studentsInLecture.filter(student => student.grade >= 60).length;
    const failedStudents = totalStudents - passedStudents;

    // Calculate mean score (average grade)
    const meanScore = (studentsInLecture.reduce((sum, student) => sum + parseFloat(student.grade), 0) / totalStudents).toFixed(2);

    // Display the lecture details
    const detailsSection = document.getElementById('results-table');
    detailsSection.innerHTML = `
        <h3>Lecture Details</h3>
        <p><strong>Total Students:</strong> ${totalStudents}</p>
        <p><strong>Number of Passed Students:</strong> ${passedStudents}</p>
        <p><strong>Number of Failed Students:</strong> ${failedStudents}</p>
        <p><strong>Mean Score:</strong> ${meanScore}</p>
        <button class="content-button" onclick="displayAllResults()">Back to Results</button>
    `;
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
function viewAllResults(lectureId) {
    if (!lectureId) {
        alert('Please select a lecture.');
        return;
    }
    const studentsInLecture = students.filter(student => student.lecture === lectureId);
    displayResults(studentsInLecture);
}

function viewFailedStudents(lectureId) {
    if (!lectureId) {
        alert('Please select a lecture.');
        return;
    }
    const failedStudents = students.filter(student => student.lecture === lectureId && student.grade < 60);
    displayResults(failedStudents);
}

function viewPassedStudents(lectureId) {
    if (!lectureId) {
        alert('Please select a lecture.');
        return;
    }
    const passedStudents = students.filter(student => student.lecture === lectureId && student.grade >= 60);
    displayResults(passedStudents);
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
