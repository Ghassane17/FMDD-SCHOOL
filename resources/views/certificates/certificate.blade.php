<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="utf-8">
    <title>Certificat d'achèvement</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
            background: #fff;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: #fff;
        }

        body {
            font-family: 'Inter', 'DejaVu Sans', Arial, sans-serif;
            background: #fff;
            color: #1f2937;
            line-height: 1.4;
            width: 297mm;
            height: 210mm;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .certificate-wrapper {
            width: 100%;
            height: 100%;
            padding: 10mm;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
        }

        .certificate {
            position: relative;
            width: 277mm;
            height: 190mm;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 3px solid #0f172a;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .certificate::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 8px;
            right: 8px;
            bottom: 8px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            pointer-events: none;
            background: #fff;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 140px;
            font-weight: 100;
            color: rgba(148, 163, 184, 0.06);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
            letter-spacing: 12px;
        }

        .content {
            position: relative;
            z-index: 1;
            text-align: center;
            max-width: 240mm;
            padding: 0 20mm;
            background: transparent;
        }

        .header {
            margin-bottom: 35px;
            background: transparent;
        }

        .title {
            font-size: 58px;
            font-weight: 300;
            color: #0f172a;
            margin-bottom: 12px;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 24px;
            color: #64748b;
            font-weight: 400;
            margin-bottom: 40px;
        }

        .main-content {
            margin-bottom: 35px;
            background: transparent;
        }

        .recipient-text {
            font-size: 26px;
            color: #475569;
            margin-bottom: 18px;
            font-weight: 400;
        }

        .name {
            font-size: 64px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 25px;
            letter-spacing: 2px;
            position: relative;
            text-transform: uppercase;
        }

        .name::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 140px;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
            border-radius: 2px;
        }

        .completion-text {
            font-size: 22px;
            color: #475569;
            margin-bottom: 18px;
            font-weight: 400;
        }

        .course-name {
            font-size: 38px;
            color: #1e40af;
            font-weight: 500;
            font-style: italic;
            margin-bottom: 28px;
            line-height: 1.3;
        }

        .date-line {
            font-size: 18px;
            color: #64748b;
            margin-bottom: 30px;
            font-weight: 500;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            max-width: 550px;
            margin-top: 25px;
        }

        .signature {
            text-align: center;
            flex: 1;
        }

        .signature-line {
            width: 180px;
            height: 2px;
            background: #cbd5e1;
            margin: 0 auto 10px;
        }

        .signature-name {
            font-size: 16px;
            color: #374151;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .signature-title {
            font-size: 14px;
            color: #9ca3af;
            font-weight: 400;
        }

        .certificate-info {
            position: absolute;
            bottom: 15mm;
            right: 20mm;
            text-align: right;
            font-size: 13px;
            color: #9ca3af;
            z-index: 1;
            background: transparent;
        }

        .certificate-code {
            margin-bottom: 6px;
            font-weight: 600;
            font-size: 16px;
        }

        .issue-date {
            font-style: italic;
            font-size: 14px;
        }

        @media print {

            html,
            body {
                width: 297mm !important;
                height: 210mm !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
            }

            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            .certificate {
                page-break-inside: avoid;
                break-inside: avoid;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
            }

            .certificate-wrapper {
                page-break-inside: avoid;
                background: #fff !important;
            }
        }
    </style>
</head>

<body>
    <div class="certificate-wrapper">
        <div class="certificate">
            <div class="watermark">CERTIFICAT</div>
            <div class="content">
                <div class="header">
                    <h1 class="title">Certificat d'achèvement</h1>
                    <p class="subtitle">Ceci certifie que</p>
                    <div class="name">{{ $certificate->learner->user->username }}</div>
                </div>

                <div class="main-content">
                    <p class="recipient-text">a réussi le cours</p>
                    <div class="course-name">{{ $certificate->course->title }}</div>
                </div>
            </div>

            <div class="certificate-info">
                <div class="certificate-code">Code du certificat : {{ $certificate->certificate_code }}</div>
                <div class="issue-date">Délivré le {{ $certificate->issued_at ? $certificate->issued_at->format('d/m/Y') : now()->format('d/m/Y') }}</div>
            </div>
        </div>
    </div>
</body>

</html>