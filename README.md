# Smart Attendance System

A product-style Flask website for facial-recognition-based attendance tracking in Python.

## Features

- Modern marketing homepage and admin dashboard
- Employee enrollment with photo upload
- Face recognition attendance capture from browser camera
- SQLite persistence for employees and attendance logs
- Department and daily attendance metrics

## Stack

- Python
- Flask
- SQLite
- OpenCV
- `face_recognition`
- Vanilla JavaScript

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the app:

```bash
python app.py
```

4. Open `http://127.0.0.1:5000`

## Product Flow

1. Go to the Employees page and enroll staff with a clear front-facing image.
2. Open the Attendance page.
3. Start the camera and capture a face.
4. The system compares the face against enrolled encodings and records attendance.

## Important Notes

- `face_recognition` depends on `dlib`, which may require C++ build tools on Windows if a wheel is unavailable.
- Use clear lighting and one visible face per image for reliable matching.
- Replace `SECRET_KEY` in production and run behind a production WSGI server.
