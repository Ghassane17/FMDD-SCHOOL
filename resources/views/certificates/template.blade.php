<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Certificate of Completion</title>
    <style>
        @font-face {
            font-family: 'Playfair Display';
            src: url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        }

        @font-face {
            font-family: 'Roboto';
            src: url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');
        }

        body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            background: #fff;
            width: 100%;
            height: 100%;
        }

        .certificate {
            width: 100%;
            height: 100%;
            padding: 30px;
            background: #fff;
            border: 15px solid #2c3e50;
            position: relative;
            box-sizing: border-box;
        }

        .certificate::before {
            content: '';
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border: 2px solid #e74c3c;
            pointer-events: none;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            color: #2c3e50;
            margin: 0;
            padding: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .content {
            text-align: center;
            margin: 30px 0;
        }

        .content p {
            font-size: 16px;
            line-height: 1.4;
            color: #34495e;
            margin: 8px 0;
        }

        .name {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #e74c3c;
            font-weight: bold;
            margin: 15px 0;
            text-transform: uppercase;
        }

        .course {
            font-size: 22px;
            color: #2c3e50;
            font-weight: 500;
            margin: 15px 0;
        }

        .date {
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 30px;
        }

        .certificate-code {
            position: absolute;
            bottom: 15px;
            right: 15px;
            font-size: 11px;
            color: #95a5a6;
        }

        .seal {
            position: absolute;
            bottom: 30px;
            left: 30px;
            width: 80px;
            height: 80px;
            border: 2px solid #e74c3c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #e74c3c;
            text-align: center;
            padding: 8px;
        }
    </style>
</head>

<body>
    <div class="certificate">
        <div class="header">
            <h1>Certificate of Completion</h1>
        </div>

        <div class="content">
            <p>This is to certify that</p>
            <div class="name">{{ $learner->user->name }}</div>
            <p>has successfully completed the course</p>
            <div class="course">{{ $course->title }}</div>
            <p>with distinction</p>
            <div class="date">Issued on: {{ $date }}</div>
        </div>

        <div class="seal">
            Official<br>Seal
        </div>

        <div class="certificate-code">
            Certificate ID: {{ $certificate->certificate_code }}
        </div>
    </div>
</body>

</html>