<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Instructor;

class InstructorSeeder extends Seeder
{
    public function run(): void
    {
        Instructor::create([
            'user_id'        => 4,
            'skills'         => json_encode(["JavaScript", "React", "Spring Boot", "Node.js"]),
            'languages'      => json_encode([
                ["name" => "Français", "code" => "FR"],
                ["name" => "Anglais", "code" => "GB"],
                ["name" => "Arabic", "code" => "AR"]
            ]),
            'certifications' => json_encode([
                ["name" => "AWS Certified Developer", "institution" => "Amazon Web Services"],
                ["name" => "Certified Kubernetes Administrator", "institution" => "Cloud Native Computing Foundation"],
                ["name" => "Google Cloud Professional Data Engineer", "institution" => "Google"],
                ["name" => "Microsoft Certified: Azure Solutions Architect Expert", "institution" => "Microsoft"],
                ["name" => "Oracle Certified Professional, Java SE 11 Developer", "institution" => "Oracle"]
            ]),
            'availability'   => json_encode([
                ["day" => "Lundi", "slots" => ["10:00", "14:00", "16:00"]],
                ["day" => "Mercredi", "slots" => ["09:00", "11:00"]],
                ["day" => "Vendredi", "slots" => ["10:00", "13:00"]],
            ]),
            'bank_info'      => [
                "iban"           => "FR76 **** **** **** **** 1234",
                "bankName"       => "CIH Bank",
                "paymentMethod"  => "Virement bancaire"
            ],
        ]);
    }
}
