<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Certificate of Completion</title>
    <style>
        @page {
            margin: 0;
            size: landscape;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica', sans-serif;
            background: #fff;
            color: #333;
        }

        .certificate {
            position: relative;
            width: 297mm;
            height: 210mm;
            background: #fff;
            padding: 20mm;
            box-sizing: border-box;
            overflow: hidden;
        }

        .border {
            position: absolute;
            top: 10mm;
            left: 10mm;
            right: 10mm;
            bottom: 10mm;
            border: 2px solid #1a365d;
            border-radius: 10mm;
            pointer-events: none;
        }

        .content {
            position: relative;
            z-index: 1;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header {
            margin-top: 20mm;
        }

        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 10mm;
        }

        .title {
            font-size: 36pt;
            font-weight: bold;
            color: #1a365d;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .subtitle {
            font-size: 18pt;
            color: #4a5568;
            margin: 5mm 0;
            font-weight: 300;
        }

        .main-text {
            font-size: 24pt;
            line-height: 1.4;
            margin: 15mm 0;
            color: #2d3748;
        }

        .name {
            font-size: 32pt;
            font-weight: bold;
            color: #1a365d;
            margin: 10mm 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .course-name {
            font-size: 20pt;
            color: #4a5568;
            margin: 5mm 0;
            font-style: italic;
        }

        .footer {
            margin-top: auto;
            padding-top: 10mm;
        }

        .signatures {
            display: flex;
            justify-content: space-between;
            margin: 15mm 20mm 0;
        }

        .signature {
            text-align: center;
            width: 200px;
        }

        .signature-line {
            border-top: 1px solid #1a365d;
            margin-bottom: 5mm;
            width: 100%;
        }

        .signature-name {
            font-size: 12pt;
            color: #4a5568;
        }

        .signature-title {
            font-size: 10pt;
            color: #718096;
        }

        .certificate-code {
            position: absolute;
            bottom: 15mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10pt;
            color: #718096;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72pt;
            color: rgba(26, 54, 93, 0.03);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
        }
    </style>
</head>

<body>
    <div class="certificate">
        <div class="border"></div>
        <div class="watermark">CERTIFICATE OF COMPLETION</div>
        <div class="content">
            <div class="header">
                <img src="{{ public_path('images/logo.png') }}" alt="Logo" class="logo">
                <h1 class="title">Certificate of Completion</h1>
                <p class="subtitle">This is to certify that</p>
            </div>

            <div class="main-content">
                <div class="name">{{ $certificate->learner->user->name }}</div>
                <p class="main-text">has successfully completed the course</p>
                <div class="course-name">{{ $certificate->course->title }}</div>
            </div>

            <div class="footer">
                <div class="signatures">
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-name">Course Instructor</div>
                        <div class="signature-title">Course Instructor</div>
                    </div>
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-name">Director of Education</div>
                        <div class="signature-title">Director of Education</div>
                    </div>
                </div>
                <div class="certificate-code">
                    Certificate Code: {{ $certificate->certificate_code }}
                </div>
            </div>
        </div>
    </div>
</body>

</html>