const startAttendanceCameraButton = document.getElementById("start-attendance-camera");
const captureAttendanceButton = document.getElementById("capture-attendance");
const attendanceCamera = document.getElementById("attendance-camera");
const attendanceSnapshot = document.getElementById("attendance-snapshot");
const attendanceResult = document.getElementById("attendance-result");

const startEnrollCameraButton = document.getElementById("start-enroll-camera");
const captureEnrollPhotoButton = document.getElementById("capture-enroll-photo");
const enrollCamera = document.getElementById("enroll-camera");
const enrollSnapshot = document.getElementById("enroll-snapshot");
const enrollResult = document.getElementById("enroll-result");
const capturedPhotoInput = document.getElementById("captured-photo");

let attendanceStream;
let enrollmentStream;

function setMessage(element, message, tone = "muted") {
    if (!element) return;
    element.className = `result-card ${tone}`;
    element.textContent = message;
}

async function openCamera(videoElement, existingStreamName) {
    if (!videoElement) return null;

    if (existingStreamName === "attendance" && attendanceStream) {
        return attendanceStream;
    }

    if (existingStreamName === "enrollment" && enrollmentStream) {
        return enrollmentStream;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
    });

    videoElement.srcObject = stream;
    if (existingStreamName === "attendance") {
        attendanceStream = stream;
    } else {
        enrollmentStream = stream;
    }
    return stream;
}

async function startAttendanceCamera() {
    try {
        await openCamera(attendanceCamera, "attendance");
        setMessage(attendanceResult, "Camera ready. Align one student face and capture attendance.");
    } catch (error) {
        setMessage(attendanceResult, "Unable to access camera. Check browser permissions.", "flash-error");
    }
}

async function startEnrollmentCamera() {
    try {
        await openCamera(enrollCamera, "enrollment");
        setMessage(enrollResult, "Enrollment camera ready. Capture one clear face for the college identity profile.");
    } catch (error) {
        setMessage(enrollResult, "Unable to access camera. Use image upload instead.", "flash-error");
    }
}

function captureCanvasImage(videoElement, canvasElement) {
    const context = canvasElement.getContext("2d");
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    return canvasElement.toDataURL("image/jpeg", 0.92);
}

function captureEnrollmentPhoto() {
    if (!enrollCamera || !enrollSnapshot || !enrollCamera.srcObject || !capturedPhotoInput) {
        setMessage(enrollResult, "Start the enrollment camera before capturing.", "flash-error");
        return;
    }

    capturedPhotoInput.value = captureCanvasImage(enrollCamera, enrollSnapshot);
    setMessage(enrollResult, "Live face capture attached. Submit the registration form to save the student.", "flash-success");
}

async function captureAttendance() {
    if (!attendanceCamera || !attendanceSnapshot || !attendanceCamera.srcObject) {
        setMessage(attendanceResult, "Start the attendance camera before capturing.", "flash-error");
        return;
    }

    const image = captureCanvasImage(attendanceCamera, attendanceSnapshot);
    setMessage(attendanceResult, "Processing face recognition...");

    try {
        const response = await fetch("/api/attendance/recognize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image })
        });
        const result = await response.json();

        if (!response.ok || !result.ok) {
            setMessage(attendanceResult, result.message || "Attendance capture failed.", "flash-error");
            return;
        }

        const student = result.student;
        const actionLabel = result.already_marked ? "already marked" : "marked present";
        setMessage(
            attendanceResult,
            `${student.name} (${student.code}) ${actionLabel} for ${student.cohort} with ${result.confidence}% confidence.`,
            "flash-success"
        );
        window.setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
        setMessage(attendanceResult, "Network error while recording attendance.", "flash-error");
    }
}

if (startAttendanceCameraButton) {
    startAttendanceCameraButton.addEventListener("click", startAttendanceCamera);
}

if (captureAttendanceButton) {
    captureAttendanceButton.addEventListener("click", captureAttendance);
}

if (startEnrollCameraButton) {
    startEnrollCameraButton.addEventListener("click", startEnrollmentCamera);
}

if (captureEnrollPhotoButton) {
    captureEnrollPhotoButton.addEventListener("click", captureEnrollmentPhoto);
}
