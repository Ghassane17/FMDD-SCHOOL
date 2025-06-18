<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="utf-8">
    <title>Certificat d'achèvement</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
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
            transform: scale(1.2);
            transform-origin: center center;
        }

        .certificate-wrapper {
            width: 100%;
            height: 100%;
            padding: 8mm;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            transform: translateY(15px);
        }

        .certificate {
            position: relative;
            width: 281mm;
            height: 194mm;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #0000ff 50%, #9333EA 75%, #000000 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .certificate::before {
            content: '';
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            bottom: 12px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            pointer-events: none;
        }

        .certificate::after {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            background: #ffffff;
            border-radius: 4px;
            pointer-events: none;
            box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .decorative-corners {
            position: absolute;
            z-index: 2;
        }

        .corner-tl {
            top: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            border-top: 4px solid #0000ff;
            border-left: 4px solid #0000ff;
        }

        .corner-tr {
            top: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-top: 4px solid #9333EA;
            border-right: 4px solid #9333EA;
        }

        .corner-bl {
            bottom: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            border-bottom: 4px solid #0000ff;
            border-left: 4px solid #0000ff;
        }

        .corner-br {
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-bottom: 4px solid #9333EA;
            border-right: 4px solid #9333EA;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 140px;
            font-weight: 100;
            color: rgba(0, 0, 255, 0.03);
            white-space: nowrap;
            pointer-events: none;
            z-index: 1;
            letter-spacing: 8px;
            font-family: 'Playfair Display', serif;
        }

        .content {
            position: relative;
            z-index: 3;
            text-align: center;
            max-width: 240mm;
            padding: 0 30mm;
            background: transparent;
            transform: translateY(10px);
        }

        .header {
            margin-bottom: 30px;
            background: transparent;
        }

        .logo-section {
            margin-bottom: 25px;
        }

        .logo-placeholder {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #0000ff, #9333EA);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
            font-weight: 700;
            box-shadow: 0 10px 25px rgba(0, 0, 255, 0.3);
        }

        .title {
            font-family: 'Playfair Display', serif;
            font-size: 56px;
            font-weight: 600;
            color: #000000;
            margin-bottom: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 22px;
            color: #6b7280;
            font-weight: 400;
            margin-bottom: 30px;
            font-style: italic;
        }

        .main-content {
            margin-bottom: 30px;
            background: transparent;
        }

        .recipient-text {
            font-size: 24px;
            color: #374151;
            margin-bottom: 15px;
            font-weight: 400;
        }

        .name {
            font-family: 'Playfair Display', serif;
            font-size: 60px;
            font-weight: 700;
            background: linear-gradient(135deg, #0000ff, #9333EA);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 25px;
            letter-spacing: 1px;
            position: relative;
            text-transform: capitalize;
        }

        .name::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 140px;
            height: 4px;
            background: linear-gradient(90deg, #0000ff, #9333EA);
            border-radius: 2px;
        }

        .completion-text {
            font-size: 22px;
            color: #374151;
            margin-bottom: 15px;
            font-weight: 400;
        }

        .course-name {
            font-family: 'Playfair Display', serif;
            font-size: 38px;
            color: #000000;
            font-weight: 600;
            font-style: italic;
            margin-bottom: 25px;
            line-height: 1.3;
            position: relative;
        }

        .course-name::before,
        .course-name::after {
            content: '"';
            font-size: 46px;
            color: #9333EA;
            font-weight: 400;
        }

        .achievement-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #0000ff, #9333EA);
            color: white;
            padding: 12px 25px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(0, 0, 255, 0.3);
        }

        .achievement-icon {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0000ff;
            font-size: 12px;
            font-weight: 700;
        }

        .date-line {
            font-size: 20px;
            color: #6b7280;
            margin-bottom: 25px;
            font-weight: 500;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            max-width: 500px;
            margin-top: 20px;
        }

        .signature {
            text-align: center;
            flex: 1;
        }

        .signature-line {
            width: 180px;
            height: 3px;
            background: linear-gradient(90deg, #0000ff, #9333EA);
            margin: 0 auto 10px;
            border-radius: 1px;
        }

        .signature-name {
            font-size: 18px;
            color: #000000;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .signature-title {
            font-size: 14px;
            color: #6b7280;
            font-weight: 400;
            font-style: italic;
        }

        .certificate-info {
            position: absolute;
            bottom: 40px;
            right: 40px;
            text-align: right;
            font-size: 14px;
            color: #6b7280;
            z-index: 3;
            background: rgba(255, 255, 255, 0.9);
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .certificate-code {
            margin-bottom: 6px;
            font-weight: 600;
            font-size: 16px;
            color: #000000;
        }

        .issue-date {
            font-style: italic;
            font-size: 14px;
        }

        .qr-placeholder {
            position: absolute;
            bottom: 40px;
            left: 40px;
            width: 75px;
            height: 75px;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #64748b;
            text-align: center;
            z-index: 3;
        }

        .excellence-seal {
            position: absolute;
            top: 45px;
            right: 90px;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            z-index: 3;
            box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
            transform: rotate(15deg);
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
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #0000ff 50%, #9333EA 75%, #000000 100%) !important;
            }

            .certificate-wrapper {
                page-break-inside: avoid;
                background: #fff !important;
            }

            .name {
                background: linear-gradient(135deg, #0000ff, #9333EA) !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
                background-clip: text !important;
            }
        }
    </style>
</head>

<body>
    <div class="certificate-wrapper">
        <div class="certificate">
            <!-- Decorative corners -->
            <div class="decorative-corners corner-tl"></div>
            <div class="decorative-corners corner-tr"></div>
            <div class="decorative-corners corner-bl"></div>
            <div class="decorative-corners corner-br"></div>

            <!-- Excellence seal -->
            <div class="excellence-seal">
                EXCELLENCE<br>ACADÉMIQUE
            </div>

            <!-- Watermark -->
            <div class="watermark">CERTIFICAT</div>

            <!-- Main content -->
            <div class="content">
                <div class="header">
                    <div class="logo-section">
                        <div class="logo-placeholder">🎓</div>
                    </div>
                    <h1 class="title">Certificat d'Excellence</h1>
                    <p class="subtitle">Attestation officielle de réussite</p>
                </div>

                <div class="main-content">
                    <p class="recipient-text">Ceci certifie que</p>
                    <div class="name">{{ $certificate->learner->user->username }}</div>

                    <div class="achievement-badge">
                        <div class="achievement-icon">✓</div>
                        Formation Complétée avec Succès
                    </div>

                    <p class="completion-text">a brillamment réussi la formation</p>
                    <div class="course-name">{{ $certificate->course->title }}</div>

                    <p class="date-line">
                        Délivré le {{ $certificate->issued_at ? $certificate->issued_at->format('d F Y') : now()->format('d F Y') }}
                    </p>
                </div>

                <div class="footer">
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-name">Directeur Académique</div>
                        <div class="signature-title">Responsable des Certifications</div>
                    </div>
                    <div style="width: 60px;"></div>
                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-name">Formateur Principal</div>
                        <div class="signature-title">Expert du Domaine</div>
                    </div>
                </div>
            </div>

            <!-- QR Code placeholder -->
            <div class="qr-placeholder">
                QR<br>CODE
            </div>

            <!-- Certificate info -->
            <div class="certificate-info">
                <div class="certificate-code">N° {{ $certificate->certificate_code }}</div>
                <div class="issue-date">Authentifié le {{ $certificate->issued_at ? $certificate->issued_at->format('d/m/Y') : now()->format('d/m/Y') }}</div>
            </div>
        </div>
    </div>
</body>

</html>