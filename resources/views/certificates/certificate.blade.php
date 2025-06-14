<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="utf-8">
    <title>Certificat d'achèvement</title>
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
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px solid #1a365d;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo {
            width: 100px;
            height: auto;
            margin-bottom: 20px;
        }

        .title {
            font-size: 36px;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 40px;
        }

        .main-content {
            text-align: center;
            margin-bottom: 40px;
        }

        .name {
            font-size: 32px;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .course-name {
            font-size: 24px;
            color: #4a5568;
            font-style: italic;
            margin-bottom: 20px;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
        }

        .signatures {
            display: flex;
            justify-content: center;
            gap: 100px;
            margin-bottom: 30px;
        }

        .signature {
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #1a365d;
            width: 200px;
            margin-bottom: 10px;
        }

        .signature-name {
            font-size: 14px;
            color: #4a5568;
        }

        .signature-title {
            font-size: 12px;
            color: #718096;
        }

        .certificate-code {
            font-size: 12px;
            color: #718096;
            margin-top: 20px;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(237, 245, 255, 0.5);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
        }
    </style>
</head>

<body>
    <div class="certificate">
        <div class="watermark">CERTIFICAT</div>

        <div class="header">
            <img src="{{ public_path('images/logo.png') }}" alt="Logo" class="logo">
            <h1 class="title">Certificat d'achèvement</h1>
            <p class="subtitle">Ceci certifie que</p>
        </div>

        <div class="main-content">
            <div class="name">{{ $certificate->learner->user->username }}</div>
            <p>a réussi le cours</p>
            <div class="course-name">{{ $certificate->course->title }}</div>
        </div>

        <div class="footer">
            <div class="signatures">
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">Formateur</div>
                    <div class="signature-title">Formateur</div>
                </div>
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">Directeur</div>
                    <div class="signature-title">Éducation</div>
                </div>
            </div>

            <div class="certificate-code">
                Code du certificat : {{ $certificate->certificate_code }}
            </div>
        </div>
    </div>
</body>

</html>